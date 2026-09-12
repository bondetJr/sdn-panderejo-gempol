import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Data fallback dipakai HANYA saat database belum di-seed atau
 * belum terkoneksi (mis. saat preview awal development).
 * Setelah `npm run prisma:seed` / data diisi Admin, data ini
 * otomatis tidak terpakai lagi.
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
  jamLayanan: "Senin - Jumat, 07.30 - 13.00 WIB",
  tahunAjaranAktif: "2026/2027",
};

export type SchoolProfile = typeof FALLBACK_SCHOOL;

/**
 * Ambil data profil sekolah. Di-cache per request (React cache)
 * supaya tidak query berkali-kali saat dipakai di Header, Footer,
 * dan Metadata sekaligus dalam satu request.
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
      jamLayanan: school.jamLayanan ?? FALLBACK_SCHOOL.jamLayanan,
      tahunAjaranAktif: school.tahunAjaranAktif ?? FALLBACK_SCHOOL.tahunAjaranAktif,
    };
  } catch {
    // DB belum terkoneksi / belum ada migrasi — pakai fallback supaya UI tetap jalan.
    return FALLBACK_SCHOOL;
  }
});
