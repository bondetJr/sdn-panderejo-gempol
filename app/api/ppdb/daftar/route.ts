
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ppdbSubmitSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from "@/lib/validations/ppdb";
import { generateNoPendaftaran } from "@/lib/utils";
import { createAdminClient, PPDB_DOCUMENTS_BUCKET } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { encryptPii, hashPiiForLookup } from "@/lib/crypto/pii";
import { Prisma, DokumenJenis } from "@prisma/client";

const DOCUMENT_FIELD_MAP: Record<string, DokumenJenis> = {
  kartuKeluarga: "KARTU_KELUARGA",
  aktaKelahiran: "AKTA_KELAHIRAN",
  ktpOrtu: "KTP_ORTU",
  fotoAnak: "FOTO_ANAK",
  kip: "KIP",
  ijazahTk: "IJAZAH_TK",
};

const REQUIRED_DOCUMENT_FIELDS = [
  "kartuKeluarga",
  "aktaKelahiran",
  "ktpOrtu",
  "fotoAnak",
] as const;

type DocCreateInput = {
  applicantId: string;
  jenis: DokumenJenis;
  fileUrl: string;
  isVerified: boolean;
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = await rateLimit(`daftar-ppdb:${ip}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Silakan coba lagi sebentar lagi." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();

    const rawFields = {
      waveId: formData.get("waveId")?.toString() ?? "",
      jalur: formData.get("jalur")?.toString() ?? "",
      jarakKeSekolahKm: formData.get("jarakKeSekolahKm")?.toString() || undefined,
      namaLengkap: formData.get("namaLengkap")?.toString() ?? "",
      nik: formData.get("nik")?.toString() ?? "",
      nisn: formData.get("nisn")?.toString() ?? "",
      tempatLahir: formData.get("tempatLahir")?.toString() ?? "",
      tanggalLahir: formData.get("tanggalLahir")?.toString() ?? "",
      jenisKelamin: formData.get("jenisKelamin")?.toString() ?? "",
      namaAyah: formData.get("namaAyah")?.toString() ?? "",
      namaIbu: formData.get("namaIbu")?.toString() ?? "",
      noHpOrtu: formData.get("noHpOrtu")?.toString() ?? "",
      alamat: formData.get("alamat")?.toString() ?? "",
    };

    const parsed = ppdbSubmitSchema.safeParse(rawFields);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data yang dikirim tidak valid.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const data = parsed.data;

    if (data.jalur === "ZONASI" && (data.jarakKeSekolahKm === undefined || data.jarakKeSekolahKm === null)) {
      return NextResponse.json(
        { error: "Jarak ke sekolah wajib diisi untuk jalur Zonasi." },
        { status: 400 }
      );
    }

    for (const field of REQUIRED_DOCUMENT_FIELDS) {
      const file = formData.get(field);
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: `Dokumen ${field} wajib diunggah.` },
          { status: 400 }
        );
      }
    }

    const allFileFields = Object.keys(DOCUMENT_FIELD_MAP);
    for (const field of allFileFields) {
      const file = formData.get(field);
      if (file instanceof File && file.size > 0) {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: `Format file ${field} tidak didukung. Gunakan PDF, JPG, atau PNG.` },
            { status: 400 }
          );
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          return NextResponse.json(
            { error: `Ukuran file ${field} maksimal ${MAX_FILE_SIZE_MB}MB.` },
            { status: 400 }
          );
        }
      }
    }

    const nikHash = hashPiiForLookup(data.nik);
    const existing = await prisma.ppdbApplicant.findFirst({
      where: { nikHash, waveId: data.waveId },
    });
    if (existing) {
      return NextResponse.json(
        {
          error:
            "NIK ini sudah terdaftar pada gelombang PPDB yang sama. Gunakan menu Cek Status untuk melihat status pendaftaran.",
        },
        { status: 409 }
      );
    }

    const tahun = new Date().getFullYear();
    let applicant: { id: string; noPendaftaran: string; status: string } | null = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const countThisYear = await prisma.ppdbApplicant.count({
        where: { noPendaftaran: { startsWith: `PPDB-${tahun}-` } },
      });
      const noPendaftaran = generateNoPendaftaran(tahun, countThisYear + 1 + attempt);

      try {
        const created = await prisma.$transaction(async (tx) => {
          const dup = await tx.ppdbApplicant.findFirst({
            where: { nikHash, waveId: data.waveId },
          });
          if (dup) {
            const err = new Error("DUPLICATE_NIK");
            (err as Error & { code?: string }).code = "DUPLICATE_NIK";
            throw err;
          }

          return await tx.ppdbApplicant.create({
            data: {
              noPendaftaran,
              waveId: data.waveId,
              namaLengkap: data.namaLengkap,
              nikEncrypted: encryptPii(data.nik),
              nikHash,
              nisn: data.nisn || null,
              tempatLahir: data.tempatLahir,
              tanggalLahir: new Date(data.tanggalLahir),
              jenisKelamin: data.jenisKelamin,
              namaAyah: data.namaAyah,
              namaIbu: data.namaIbu,
              noHpOrtuEncrypted: encryptPii(data.noHpOrtu),
              alamat: data.alamat,
              jarakKeSekolahKm: data.jarakKeSekolahKm ?? null,
              status: "MENUNGGU_VERIFIKASI",
            },
          });
        });
        applicant = created;
        break;
      } catch (e: unknown) {
        lastError = e;
        if (e instanceof Error && e.message === "DUPLICATE_NIK") {
          return NextResponse.json(
            { error: "NIK ini sudah terdaftar pada gelombang yang sama." },
            { status: 409 }
          );
        }
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            const target = e.meta?.target as string[] | string | undefined;
            const targetStr = Array.isArray(target) ? target.join(",") : target ?? "";
            if (targetStr.includes("noPendaftaran")) {
              console.warn(`[PPDB] duplicate noPendaftaran ${noPendaftaran}, retry ${attempt + 1}`);
              continue;
            }
          }
        }
        throw e;
      }
    }

    if (!applicant) {
      console.error("PPDB failed after retries", lastError);
      return NextResponse.json(
        { error: "Gagal membuat nomor pendaftaran, silakan coba lagi." },
        { status: 500 }
      );
    }

    const supabase = createAdminClient();
    const docCreates: DocCreateInput[] = [];
    for (const [field, jenis] of Object.entries(DOCUMENT_FIELD_MAP)) {
      const file = formData.get(field);
      if (!(file instanceof File) || file.size === 0) continue;

      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${applicant.id}/${field}-${Date.now()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(PPDB_DOCUMENTS_BUCKET)
        .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error(`Gagal upload dokumen ${field}:`, uploadError.message);
        continue;
      }

      docCreates.push({
        applicantId: applicant.id,
        jenis,
        fileUrl: path,
        isVerified: false,
      });
    }

    if (docCreates.length > 0) {
      await prisma.ppdbDocument.createMany({ data: docCreates });
    }

    return NextResponse.json({
      data: {
        noPendaftaran: applicant.noPendaftaran,
        status: applicant.status,
      },
    });
  } catch (err) {
    console.error("PPDB submit error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
