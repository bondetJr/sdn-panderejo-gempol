/**
 * PALET WARNA MATA PELAJARAN
 * -------------------------------------------------------
 * CATATAN DESAIN: Ini adalah "content color-coding" (label kategori
 * mata pelajaran), BUKAN warna brand/UI chrome. Warna brand utama
 * (header, tombol, CTA) tetap 100% pakai token dari lib/tokens.ts.
 * Palet di bawah sengaja dipilih nuansa pastel/lembut (rendah
 * saturasi) agar selaras dengan estetika "quiet luxury" 2026 dan
 * tidak bentrok dengan token warna brand.
 * -------------------------------------------------------
 */

export type Subject = {
  id: string;
  nama: string;
  singkatan: string;
  badgeClass: string; // bg + text + border, semua pastel
};

export const SUBJECTS: Subject[] = [
  {
    id: "agama",
    nama: "Pendidikan Agama & Budi Pekerti",
    singkatan: "PAI",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "pancasila",
    nama: "Pendidikan Pancasila",
    singkatan: "PPKn",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    id: "bindo",
    nama: "Bahasa Indonesia",
    singkatan: "B.Indo",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: "matematika",
    nama: "Matematika",
    singkatan: "MTK",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    id: "ipas",
    nama: "Ilmu Pengetahuan Alam & Sosial",
    singkatan: "IPAS",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "pjok",
    nama: "Pendidikan Jasmani, Olahraga & Kesehatan",
    singkatan: "PJOK",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "sbdp",
    nama: "Seni Budaya & Prakarya",
    singkatan: "SBdP",
    badgeClass: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
  {
    id: "b-inggris",
    nama: "Bahasa Inggris",
    singkatan: "B.Ing",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  {
    id: "b-jawa",
    nama: "Bahasa Jawa (Muatan Lokal)",
    singkatan: "B.Jawa",
    badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200",
  },
  {
    id: "btq",
    nama: "Baca Tulis Al Quran (Muatan Lokal)",
    singkatan: "BTQ",
    badgeClass: "bg-lime-50 text-lime-700 border-lime-200",
  },
  {
    id: "ekskul",
    nama: "Pengembangan Diri / Ekstrakurikuler",
    singkatan: "Ekskul",
    badgeClass: "bg-teal-50 text-primary-teal-deep border-teal-200",
  },
];

export function getSubject(id: string) {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0];
}

export type JadwalSlot = {
  jamKe: number;
  waktu: string; // "07.00 - 07.35"
  subjectId: string | "istirahat";
};

export type JadwalHarian = {
  hari: string;
  slots: JadwalSlot[];
};

/**
 * Data jadwal CONTOH per tingkat kelas (1-6), mengikuti pola umum
 * Kurikulum Merdeka SD. Ini data ilustrasi — silakan sesuaikan
 * dengan jadwal riil sekolah. Belum ada modul CRUD khusus jadwal
 * di Dashboard Admin; beri tahu saya kalau Bapak/Ibu ingin
 * dibuatkan (model Prisma `ScheduleSlot` + halaman kelola).
 */
export function getJadwalByTingkat(tingkat: number): JadwalHarian[] {
  const pagi: JadwalSlot[] = [
    { jamKe: 1, waktu: "07.00 - 07.35", subjectId: "agama" },
    { jamKe: 2, waktu: "07.35 - 08.10", subjectId: "bindo" },
    { jamKe: 3, waktu: "08.10 - 08.45", subjectId: "bindo" },
    { jamKe: 4, waktu: "08.45 - 09.20", subjectId: "matematika" },
    { jamKe: 0, waktu: "09.20 - 09.35", subjectId: "istirahat" },
    { jamKe: 5, waktu: "09.35 - 10.10", subjectId: "matematika" },
    { jamKe: 6, waktu: "10.10 - 10.45", subjectId: "ipas" },
    { jamKe: 7, waktu: "10.45 - 11.20", subjectId: "pjok" },
  ];

  const base: JadwalHarian[] = [
    { hari: "Senin", slots: pagi },
    {
      hari: "Selasa",
      slots: [
        { jamKe: 1, waktu: "07.00 - 07.35", subjectId: "pancasila" },
        { jamKe: 2, waktu: "07.35 - 08.10", subjectId: "matematika" },
        { jamKe: 3, waktu: "08.10 - 08.45", subjectId: "matematika" },
        { jamKe: 4, waktu: "08.45 - 09.20", subjectId: "ipas" },
        { jamKe: 0, waktu: "09.20 - 09.35", subjectId: "istirahat" },
        { jamKe: 5, waktu: "09.35 - 10.10", subjectId: "sbdp" },
        { jamKe: 6, waktu: "10.10 - 10.45", subjectId: "sbdp" },
        { jamKe: 7, waktu: "10.45 - 11.20", subjectId: "b-jawa" },
      ],
    },
    {
      hari: "Rabu",
      slots: [
        { jamKe: 1, waktu: "07.00 - 07.35", subjectId: "bindo" },
        { jamKe: 2, waktu: "07.35 - 08.10", subjectId: "bindo" },
        { jamKe: 3, waktu: "08.10 - 08.45", subjectId: "b-inggris" },
        { jamKe: 4, waktu: "08.45 - 09.20", subjectId: "ipas" },
        { jamKe: 0, waktu: "09.20 - 09.35", subjectId: "istirahat" },
        { jamKe: 5, waktu: "09.35 - 10.10", subjectId: "matematika" },
        { jamKe: 6, waktu: "10.10 - 10.45", subjectId: "pjok" },
        { jamKe: 7, waktu: "10.45 - 11.20", subjectId: "pjok" },
      ],
    },
    {
      hari: "Kamis",
      slots: [
        { jamKe: 1, waktu: "07.00 - 07.35", subjectId: "agama" },
        { jamKe: 2, waktu: "07.35 - 08.10", subjectId: "agama" },
        { jamKe: 3, waktu: "08.10 - 08.45", subjectId: "bindo" },
        { jamKe: 4, waktu: "08.45 - 09.20", subjectId: "matematika" },
        { jamKe: 0, waktu: "09.20 - 09.35", subjectId: "istirahat" },
        { jamKe: 5, waktu: "09.35 - 10.10", subjectId: "pancasila" },
        { jamKe: 6, waktu: "10.10 - 10.45", subjectId: "sbdp" },
        { jamKe: 7, waktu: "10.45 - 11.20", subjectId: "ekskul" },
      ],
    },
    {
      hari: "Jumat",
      slots: [
        { jamKe: 1, waktu: "07.00 - 07.35", subjectId: "pjok" },
        { jamKe: 2, waktu: "07.35 - 08.10", subjectId: "pjok" },
        { jamKe: 3, waktu: "08.10 - 08.45", subjectId: "b-inggris" },
        { jamKe: 4, waktu: "08.45 - 09.20", subjectId: "ipas" },
        { jamKe: 0, waktu: "09.20 - 09.35", subjectId: "istirahat" },
        { jamKe: 5, waktu: "09.35 - 10.10", subjectId: "b-jawa" },
        { jamKe: 6, waktu: "10.10 - 10.45", subjectId: "ekskul" },
      ],
    },
  ];

  // Tingkat lebih tinggi (5-6) diberi 1 jam tambahan mapel inti sebagai variasi ilustrasi
  if (tingkat >= 5) {
    base[0].slots.push({
      jamKe: 8,
      waktu: "11.20 - 11.55",
      subjectId: "matematika",
    });
  }

  return base;
}
