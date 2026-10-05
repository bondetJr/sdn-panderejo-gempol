import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Data fallback dipakai HANYA saat database belum di-seed atau
 * belum terkoneksi (mis. saat preview awal development).
 * Setelah data diisi Admin, data ini otomatis tidak terpakai lagi.
 */
const FALLBACK_SCHOOL = {
  nama: "SD Negeri Panderejo Gempol",
  npsn: "20519616",
  tagline: "Belajar Seru, Karakter Kuat, Berakhlak Mulia",
  alamat: "Ds. Panderejo, Kec. Gempol, Kab. Pasuruan, Jawa Timur",
  desa: "Panderejo",
  kecamatan: "Gempol",
  kabupaten: "Pasuruan",
  provinsi: "Jawa Timur",
  kodePos: null as string | null,
  telepon: "(0343) 000000",
  email: "sdnpanderejogempol@gmail.com",
  logoUrl: null as string | null,
  mapsEmbedUrl: null as string | null,
  akreditasi: "A",
  akreditasiTahun: null as number | null,
  tahunAjaranAktif: "2026/2027",
  jamLayanan: "Senin - Jumat, 07.30 - 13.00 WIB",
  visi: null as string | null,
  misi: null as string | null,
  sejarah: null as string | null,
  kurikulumText: null as string | null,
  strukturOrgUrl: null as string | null,
};

export type SchoolProfile = typeof FALLBACK_SCHOOL;

/**
 * Ambil data profil sekolah lengkap termasuk visi, misi, sejarah, kurikulum.
 * Di-cache per request (React cache) supaya tidak query berkali-kali.
 * FIX: Sekarang include visi, misi, sejarah, kurikulumText yang sebelumnya hilang!
 */
export const getSchoolProfile = cache(async (): Promise<SchoolProfile> => {
  try {
    const school = await prisma.school.findFirst();
    if (!school) return FALLBACK_SCHOOL;
    return {
      nama: school.nama,
      npsn: school.npsn,
      tagline: school.tagline ?? FALLBACK_SCHOOL.tagline,
      alamat: school.alamat ?? FALLBACK_SCHOOL.alamat,
      desa: school.desa ?? FALLBACK_SCHOOL.desa,
      kecamatan: school.kecamatan ?? FALLBACK_SCHOOL.kecamatan,
      kabupaten: school.kabupaten ?? FALLBACK_SCHOOL.kabupaten,
      provinsi: school.provinsi ?? FALLBACK_SCHOOL.provinsi,
      kodePos: school.kodePos,
      telepon: school.telepon ?? FALLBACK_SCHOOL.telepon,
      email: school.email ?? FALLBACK_SCHOOL.email,
      logoUrl: school.logoUrl,
      mapsEmbedUrl: school.mapsEmbedUrl,
      akreditasi: school.akreditasi ?? FALLBACK_SCHOOL.akreditasi,
      akreditasiTahun: school.akreditasiTahun ?? null,
      tahunAjaranAktif: school.tahunAjaranAktif ?? FALLBACK_SCHOOL.tahunAjaranAktif,
      jamLayanan: school.jamLayanan ?? FALLBACK_SCHOOL.jamLayanan,
      visi: school.visi ?? null,
      misi: school.misi ?? null,
      sejarah: school.sejarah ?? null,
      kurikulumText: school.kurikulumText ?? null,
      strukturOrgUrl: school.strukturOrgUrl ?? null,
    };
  } catch {
    return FALLBACK_SCHOOL;
  }
});

/**
 * Helper untuk halaman Visi Misi - return hanya visi, misi, sejarah
 */
export const getVisiMisi = cache(async () => {
  const profile = await getSchoolProfile();
  return {
    visi: profile.visi,
    misi: profile.misi,
    sejarah: profile.sejarah,
  };
});
