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

// FIX CRITICAL: Hapus DUMMY_APPLICANTS dengan NIK palsu yang mirip NIK asli.
// Sebelumnya: ada 8 data dummy dengan NIK 357414xxxx yang bisa dikira data asli kalau DB down.
// Sekarang: tidak ada dummy yang menyerupai data real. Kalau butuh data dev, pakai seed terpisah.

export async function getApplicantsList(statusFilter?: string) {
  try {
    const data = await prisma.ppdbApplicant.findMany({
      where:
        statusFilter && statusFilter !== "SEMUA"
          ? { status: statusFilter as never }
          : undefined,
      include: { wave: true },
      orderBy: { createdAt: "desc" },
    });

    // FIX: Jangan throw error saat data kosong. Return array kosong, UI akan tampilkan "Belum ada pendaftar".
    // Sebelumnya: if (data.length === 0) throw -> trigger dummy, admin kira ada pendaftar padahal kosong.
    return data.map((a) => ({
      id: a.id,
      noPendaftaran: a.noPendaftaran,
      namaLengkap: a.namaLengkap,
      // NIK selalu dari hasil dekripsi, bukan dari field plain yang sudah deprecated
      nik: a.nikEncrypted ? safeDecryptPii(a.nikEncrypted) : "***",
      jalur: a.wave.jalur,
      status: a.status,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    // FIX: Jangan return dummy diam-diam. Log error yang jelas, return kosong.
    console.error("[getApplicantsList] Gagal ambil data PPDB:", error);
    // Di production, jangan tampilkan dummy. Biar admin tau DB error.
    return [];
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

export const JENIS_LABEL: Record<string, string> = {
  KARTU_KELUARGA: "Kartu Keluarga",
  AKTA_KELAHIRAN: "Akta Kelahiran",
  KTP_ORTU: "KTP Orang Tua",
  KIP: "KIP",
  IJAZAH_TK: "Ijazah TK",
  FOTO_ANAK: "Foto Anak",
};

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
        } catch (err) {
          console.error(`[getApplicantDetail] Gagal buat signed URL untuk ${doc.id}:`, err);
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
      nik: applicant.nikEncrypted ? safeDecryptPii(applicant.nikEncrypted) : "***",
      nisn: applicant.nisn,
      tempatLahir: applicant.tempatLahir ?? "-",
      tanggalLahir: applicant.tanggalLahir ?? new Date(),
      jenisKelamin: applicant.jenisKelamin ?? "-",
      namaAyah: applicant.namaAyah ?? "-",
      namaIbu: applicant.namaIbu ?? "-",
      noHpOrtu: applicant.noHpOrtuEncrypted
        ? safeDecryptPii(applicant.noHpOrtuEncrypted)
        : "***",
      alamat: applicant.alamat,
      jarakKeSekolahKm: applicant.jarakKeSekolahKm,
      status: applicant.status,
      catatanVerifikasi: applicant.catatanVerifikasi,
      jalur: applicant.wave.jalur,
      tahunAjaran: applicant.wave.tahunAjaran,
      documents,
    };
  } catch (error) {
    // FIX: Hapus fallback dummy yang return data palsu. Kalau error, return null biar UI tampilkan "Data tidak ditemukan".
    console.error(`[getApplicantDetail] Gagal ambil detail ${id}:`, error);
    return null;
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
    return data;
  } catch (error) {
    console.error("[getAllWavesAdmin] Gagal ambil gelombang PPDB:", error);
    return [];
  }
}
