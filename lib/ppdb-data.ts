import { cache } from "react";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------
// GELOMBANG PPDB AKTIF
// ---------------------------------------------------------------

const JALUR_LABEL: Record<string, string> = {
  ZONASI: "Zonasi",
  AFIRMASI: "Afirmasi (KIP/KKS)",
  PERPINDAHAN: "Perpindahan Orang Tua",
};

const JALUR_SYARAT_DEFAULT: Record<string, string[]> = {
  ZONASI: [
    "Kartu Keluarga (KK) yang menunjukkan domisili di sekitar sekolah",
    "Akta Kelahiran",
    "KTP Orang Tua/Wali",
    "Berusia minimal 6 tahun pada 1 Juli tahun ajaran berjalan",
  ],
  AFIRMASI: [
    "Kartu Indonesia Pintar (KIP) atau Kartu Keluarga Sejahtera (KKS)",
    "Kartu Keluarga (KK)",
    "Akta Kelahiran",
    "KTP Orang Tua/Wali",
  ],
  PERPINDAHAN: [
    "Surat keterangan pindah tugas orang tua",
    "Kartu Keluarga (KK)",
    "Akta Kelahiran",
    "KTP Orang Tua/Wali",
    "Rapor/keterangan dari sekolah asal (jika pindah dari kelas berjalan)",
  ],
};

export type WaveRegistrationStatus = "UPCOMING" | "OPEN" | "CLOSED";

/** Bandingkan tanggal sekarang dengan periode gelombang untuk tentukan statusnya. */
export function getWaveRegistrationStatus(wave: {
  isActive: boolean;
  tanggalBuka: Date;
  tanggalTutup: Date;
}): WaveRegistrationStatus {
  if (!wave.isActive) return "CLOSED";
  const now = new Date();
  if (now < wave.tanggalBuka) return "UPCOMING";
  if (now > wave.tanggalTutup) return "CLOSED";
  return "OPEN";
}

export const getActivePpdbWaves = cache(async () => {
  try {
    const data = await prisma.ppdbWave.findMany({
      where: { isActive: true },
      orderBy: { jalur: "asc" },
    });
    if (data.length === 0) throw new Error("empty");
    return data.map((w) => ({
      ...w,
      jalurLabel: JALUR_LABEL[w.jalur] ?? w.jalur,
      syaratList: w.syaratText
        ? w.syaratText.split("\n").filter(Boolean)
        : JALUR_SYARAT_DEFAULT[w.jalur] ?? [],
    }));
  } catch {
    const now = new Date();
    const tanggalTutup = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
    return (["ZONASI", "AFIRMASI", "PERPINDAHAN"] as const).map(
      (jalur, idx) => ({
        id: `dummy-wave-${jalur}`,
        tahunAjaran: "2026/2027",
        jalur,
        jalurLabel: JALUR_LABEL[jalur],
        kuota: 32 - idx * 4,
        kuotaTerisi: 10 + idx * 3,
        syaratText: "",
        syaratList: JALUR_SYARAT_DEFAULT[jalur],
        tanggalBuka: now,
        tanggalTutup,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
    );
  }
});

/**
 * Khusus untuk halaman /ppdb/daftar — hanya kembalikan gelombang yang
 * BENAR-BENAR sedang buka (isActive DAN tanggal sekarang ada di antara
 * tanggalBuka-tanggalTutup). Beda dengan getActivePpdbWaves() yang
 * dipakai di /ppdb/informasi (menampilkan semua gelombang aktif
 * termasuk yang belum dibuka / sudah lewat, lengkap dengan badge status).
 */
export const getOpenPpdbWaves = cache(async () => {
  const allWaves = await getActivePpdbWaves();
  return allWaves.filter((w) => getWaveRegistrationStatus(w) === "OPEN");
});

// ---------------------------------------------------------------
// CEK STATUS — HANYA return data milik pendaftar yang cocok persis
// (noPendaftaran + NIK). TIDAK PERNAH mengembalikan data pendaftar
// lain, dan TIDAK mengembalikan NIK/no HP/alamat siapa pun di
// response ini — hanya field yang relevan untuk ditampilkan ke
// pendaftar itu sendiri.
// ---------------------------------------------------------------

export type PpdbStatusResult = {
  noPendaftaran: string;
  namaLengkap: string;
  jalur: string;
  status: string;
  catatanVerifikasi: string | null;
  tahunAjaran: string;
} | null;

export async function checkPpdbStatus(
  noPendaftaran: string,
  nik: string
): Promise<PpdbStatusResult> {
  try {
    const applicant = await prisma.ppdbApplicant.findFirst({
      where: { noPendaftaran, nik },
      include: { wave: true },
    });
    if (!applicant) return null;
    return {
      noPendaftaran: applicant.noPendaftaran,
      namaLengkap: applicant.namaLengkap,
      jalur: applicant.wave.jalur,
      status: applicant.status,
      catatanVerifikasi: applicant.catatanVerifikasi,
      tahunAjaran: applicant.wave.tahunAjaran,
    };
  } catch {
    // Fallback demo: hanya no. pendaftaran contoh berikut yang "ditemukan"
    if (noPendaftaran === "PPDB-2026-000001" && nik === "3514012345670001") {
      return {
        noPendaftaran: "PPDB-2026-000001",
        namaLengkap: "Contoh Nama Siswa",
        jalur: "ZONASI",
        status: "DIVERIFIKASI",
        catatanVerifikasi:
          "Berkas lengkap dan telah diverifikasi. Menunggu pengumuman hasil seleksi.",
        tahunAjaran: "2026/2027",
      };
    }
    return null;
  }
}
