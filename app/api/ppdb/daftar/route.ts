import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ppdbSubmitSchema, ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from "@/lib/validations/ppdb";
import { generateNoPendaftaran } from "@/lib/utils";
import { createAdminClient, PPDB_DOCUMENTS_BUCKET } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const DOCUMENT_FIELD_MAP: Record<string, string> = {
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
];

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`daftar-ppdb:${ip}`, {
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

    // --- 1. Validasi field teks ---
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

    // --- 2. Validasi dokumen wajib & tipe/ukuran file ---
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

    // --- 3. Cek duplikasi NIK pada wave yang sama ---
    const existing = await prisma.ppdbApplicant.findFirst({
      where: { nik: data.nik, waveId: data.waveId },
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

    // --- 4. Generate nomor pendaftaran unik ---
    const tahun = new Date().getFullYear();
    const countThisYear = await prisma.ppdbApplicant.count({
      where: { noPendaftaran: { startsWith: `PPDB-${tahun}-` } },
    });
    const noPendaftaran = generateNoPendaftaran(tahun, countThisYear + 1);

    // --- 5. Simpan data pendaftar ---
    const applicant = await prisma.ppdbApplicant.create({
      data: {
        noPendaftaran,
        waveId: data.waveId,
        namaLengkap: data.namaLengkap,
        nik: data.nik,
        nisn: data.nisn || null,
        tempatLahir: data.tempatLahir,
        tanggalLahir: new Date(data.tanggalLahir),
        jenisKelamin: data.jenisKelamin,
        namaAyah: data.namaAyah,
        namaIbu: data.namaIbu,
        noHpOrtu: data.noHpOrtu,
        alamat: data.alamat,
        jarakKeSekolahKm: data.jarakKeSekolahKm ?? null,
        status: "MENUNGGU_VERIFIKASI",
      },
    });

    // --- 6. Upload dokumen ke Supabase Storage (bucket PRIVAT) ---
    const supabase = createAdminClient();
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
        // Dokumen gagal upload tidak menghentikan seluruh proses
        // pendaftaran (data inti sudah tersimpan), tapi dicatat agar
        // admin bisa follow up manual.
        console.error(`Gagal upload dokumen ${field}:`, uploadError.message);
        continue;
      }

      await prisma.ppdbDocument.create({
        data: {
          applicantId: applicant.id,
          jenis: jenis as
            | "KARTU_KELUARGA"
            | "AKTA_KELAHIRAN"
            | "KTP_ORTU"
            | "KIP"
            | "IJAZAH_TK"
            | "FOTO_ANAK",
          fileUrl: path, // simpan PATH, bukan public URL — bucket privat, generate signed URL saat admin butuh akses
          isVerified: false,
        },
      });
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
