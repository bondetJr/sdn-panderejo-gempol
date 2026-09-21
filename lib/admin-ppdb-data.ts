import { prisma } from "@/lib/prisma";
import { createAdminClient, PPDB_DOCUMENTS_BUCKET } from "@/lib/supabase/server";
import { safeDecryptPii } from "@/lib/crypto/pii";

export type PpdbApplicantListItem = {
  id: string;
  noPendaftaran: string;
  namaLengkap: string;
  nik: string;
  jalur: string;
  status: string;
  createdAt: Date;
};

const DUMMY_APPLICANTS: PpdbApplicantListItem[] = Array.from({ length: 8 }).map(
  (_, i) => ({
    id: `dummy-app-${i}`,
    noPendaftaran: `PPDB-2026-${String(40 + i).padStart(6, "0")}`,
    namaLengkap: [
      "Ananda Putri Wijaya",
      "Rizky Ramadhan",
      "Salsabila Az-Zahra",
      "Bima Satria Nugroho",
      "Kayla Ramadhani",
      "Fajar Setiawan",
      "Zahra Anggraini",
      "Dimas Prasetyo",
    ][i],
    nik: `357414${String(1000000 + i).padStart(10, "0")}`,
    jalur: ["ZONASI", "AFIRMASI", "PERPINDAHAN"][i % 3],
    status: ["MENUNGGU_VERIFIKASI", "DIVERIFIKASI", "DITERIMA", "CADANGAN", "DITOLAK"][
      i % 5
    ],
    createdAt: new Date(Date.now() - i * 3600000),
  })
);

export async function getApplicantsList(statusFilter?: string) {
  try {
    const data = await prisma.ppdbApplicant.findMany({
      where: statusFilter && statusFilter !== "SEMUA" ? { status: statusFilter as never } : undefined,
      include: { wave: true },
      orderBy: { createdAt: "desc" },
    });
    if (data.length === 0) throw new Error("empty");
    return data.map((a) => ({
      id: a.id,
      noPendaftaran: a.noPendaftaran,
      namaLengkap: a.namaLengkap,
      nik: a.nikEncrypted ? safeDecryptPii(a.nikEncrypted) : a.nik,
      jalur: a.wave.jalur,
      status: a.status,
      createdAt: a.createdAt,
    }));
  } catch {
    if (!statusFilter || statusFilter === "SEMUA") return DUMMY_APPLICANTS;
    return DUMMY_APPLICANTS.filter((a) => a.status === statusFilter);
  }
}

export type ApplicantDetail = {
  id: string;
  noPendaftaran: string;
  namaLengkap: string;
  nik: string;
  nisn: string | null;
  tempatLahir: string;
  tanggalLahir: Date;
  jenisKelamin: string;
  namaAyah: string;
  namaIbu: string;
  noHpOrtu: string;
  alamat: string;
  jarakKeSekolahKm: number | null;
  status: string;
  catatanVerifikasi: string | null;
  jalur: string;
  tahunAjaran: string;
  documents: {
    id: string;
    jenis: string;
    isVerified: boolean;
    signedUrl: string | null;
  }[];
};

const JENIS_LABEL: Record<string, string> = {
  KARTU_KELUARGA: "Kartu Keluarga",
  AKTA_KELAHIRAN: "Akta Kelahiran",
  KTP_ORTU: "KTP Orang Tua",
  KIP: "KIP",
  IJAZAH_TK: "Ijazah TK",
  FOTO_ANAK: "Foto Anak",
};

export { JENIS_LABEL };

export async function getApplicantDetail(
  id: string
): Promise<ApplicantDetail | null> {
  try {
    const applicant = await prisma.ppdbApplicant.findUnique({
      where: { id },
      include: { wave: true, documents: true },
    });
    if (!applicant) return null;

    const supabase = createAdminClient();
    const documents = await Promise.all(
      applicant.documents.map(async (doc) => {
        let signedUrl: string | null = null;
        try {
          const { data } = await supabase.storage
            .from(PPDB_DOCUMENTS_BUCKET)
            .createSignedUrl(doc.fileUrl, 60 * 10); // berlaku 10 menit
          signedUrl = data?.signedUrl ?? null;
        } catch {
          signedUrl = null;
        }
        return {
          id: doc.id,
          jenis: doc.jenis,
          isVerified: doc.isVerified,
          signedUrl,
        };
      })
    );

    return {
      id: applicant.id,
      noPendaftaran: applicant.noPendaftaran,
      namaLengkap: applicant.namaLengkap,
      nik: applicant.nikEncrypted ? safeDecryptPii(applicant.nikEncrypted) : applicant.nik,
      nisn: applicant.nisn,
      tempatLahir: applicant.tempatLahir ?? "-",
      tanggalLahir: applicant.tanggalLahir ?? new Date(),
      jenisKelamin: applicant.jenisKelamin ?? "-",
      namaAyah: applicant.namaAyah ?? "-",
      namaIbu: applicant.namaIbu ?? "-",
      noHpOrtu: applicant.noHpOrtuEncrypted ? safeDecryptPii(applicant.noHpOrtuEncrypted) : applicant.noHpOrtu,
      alamat: applicant.alamat,
      jarakKeSekolahKm: applicant.jarakKeSekolahKm,
      status: applicant.status,
      catatanVerifikasi: applicant.catatanVerifikasi,
      jalur: applicant.wave.jalur,
      tahunAjaran: applicant.wave.tahunAjaran,
      documents,
    };
  } catch {
    // Fallback demo (tanpa dokumen asli — hanya untuk preview UI)
    const dummy = DUMMY_APPLICANTS.find((a) => a.id === id);
    if (!dummy) return null;
    return {
      id: dummy.id,
      noPendaftaran: dummy.noPendaftaran,
      namaLengkap: dummy.namaLengkap,
      nik: dummy.nik,
      nisn: "3050123456",
      tempatLahir: "Pasuruan",
      tanggalLahir: new Date("2020-05-14"),
      jenisKelamin: "L",
      namaAyah: "[Nama Ayah]",
      namaIbu: "[Nama Ibu]",
      noHpOrtu: "081234567890",
      alamat: "Ds. Panderejo, Kec. Gempol, Kab. Pasuruan",
      jarakKeSekolahKm: 1.2,
      status: dummy.status,
      catatanVerifikasi: null,
      jalur: dummy.jalur,
      tahunAjaran: "2026/2027",
      documents: (["KARTU_KELUARGA", "AKTA_KELAHIRAN", "KTP_ORTU", "FOTO_ANAK"] as const).map(
        (jenis, i) => ({
          id: `dummy-doc-${i}`,
          jenis,
          isVerified: false,
          signedUrl: null,
        })
      ),
    };
  }
}

// ---------------------------------------------------------------
// GELOMBANG PPDB (untuk halaman /admin/ppdb/gelombang)
// ---------------------------------------------------------------

export async function getAllWavesAdmin() {
  try {
    const data = await prisma.ppdbWave.findMany({
      orderBy: [{ isActive: "desc" }, { tanggalBuka: "desc" }],
      include: { _count: { select: { applicants: true } } },
    });
    if (data.length === 0) throw new Error("empty");
    return data;
  } catch {
    const now = new Date();
    return (["ZONASI", "AFIRMASI", "PERPINDAHAN"] as const).map((jalur, i) => ({
      id: `dummy-wave-${jalur}`,
      tahunAjaran: "2026/2027",
      jalur,
      kuota: 32 - i * 4,
      kuotaTerisi: 10 + i * 3,
      syaratText: "",
      tanggalBuka: now,
      tanggalTutup: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
      isActive: true,
      createdAt: now,
      updatedAt: now,
      _count: { applicants: 10 + i * 3 },
    }));
  }
}
