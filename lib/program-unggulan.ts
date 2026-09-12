/**
 * 6 PROGRAM UNGGULAN SDN PANDEREJO GEMPOL
 * -------------------------------------------------------
 * Konten statis (bukan dari database) karena sifatnya jarang
 * berubah. Kalau nanti ingin dikelola dari Dashboard Admin,
 * tinggal dibuatkan model Prisma `FlagshipProgram` mengikuti
 * pola `Facility` — beri tahu saya kapan saja.
 * -------------------------------------------------------
 */

export type ProgramUnggulan = {
  id: string;
  nama: string;
  deskripsi: string;
  icon: string; // nama icon lucide-react
};

export const PROGRAM_UNGGULAN: ProgramUnggulan[] = [
  {
    id: "religius",
    nama: "Program Religius & Berakhlakul Karimah",
    deskripsi:
      "Membiasakan doa, sholat berjamaah, dan penguatan akhlak mulia dalam keseharian siswa.",
    icon: "HeartHandshake",
  },
  {
    id: "ramah-anak",
    nama: "Program Ramah Anak",
    deskripsi:
      "Lingkungan belajar yang aman, nyaman, dan menyenangkan, bebas dari kekerasan dan perundungan.",
    icon: "Smile",
  },
  {
    id: "literasi-numerasi",
    nama: "Program Budaya Literasi & Numerasi",
    deskripsi:
      "Membangun kebiasaan membaca, menulis, dan berhitung sejak dini melalui kegiatan rutin sekolah.",
    icon: "BookOpenCheck",
  },
  {
    id: "lingkungan-sehat",
    nama: "Program Lingkungan Sehat Berbudaya Bersih",
    deskripsi:
      "Menanamkan kebiasaan hidup bersih, sehat, dan peduli lingkungan sekolah sejak usia dini.",
    icon: "Leaf",
  },
  {
    id: "prestasi",
    nama: "Program Prestasi Akademik & Non-Akademik",
    deskripsi:
      "Mendorong pencapaian siswa di bidang akademik maupun non-akademik seperti olahraga dan seni.",
    icon: "Trophy",
  },
  {
    id: "7-kebiasaan",
    nama: "Program 7 Kebiasaan Anak Indonesia Hebat",
    deskripsi:
      "Menerapkan 7 kebiasaan positif harian untuk membentuk karakter generasi Indonesia yang unggul.",
    icon: "ListChecks",
  },
];
