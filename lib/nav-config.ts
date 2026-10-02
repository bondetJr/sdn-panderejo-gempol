export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  href?: string;
  items?: NavItem[];
};

export const NAV_CONFIG: NavGroup[] = [
  {
    label: "Beranda",
    href: "/",
  },
  {
    label: "Profil Sekolah",
    href: "/profil",
    items: [
      { label: "Visi, Misi & Sejarah", href: "/profil/visi-misi" },
      { label: "Sambutan Kepala Sekolah", href: "/profil/sambutan-kepala-sekolah" },
      { label: "Struktur Organisasi", href: "/profil/struktur-organisasi" },
      { label: "Guru & Tenaga Kependidikan", href: "/guru-dan-tendik" },
      { label: "Fasilitas Sekolah", href: "/profil/fasilitas" },
      { label: "Prestasi & Akreditasi", href: "/profil/akreditasi-prestasi" },
    ],
  },
  {
    label: "Akademik",
    href: "/akademik",
    items: [
      { label: "Kurikulum", href: "/akademik/kurikulum" },
      { label: "Program Unggulan", href: "/akademik/program-unggulan" },
      { label: "Kalender Akademik", href: "/akademik/kalender-akademik" },
      { label: "Jadwal Pelajaran", href: "/akademik/jadwal-pelajaran" },
      { label: "Rombongan Belajar", href: "/akademik/rombongan-belajar" },
      { label: "Ekstrakurikuler", href: "/akademik/ekstrakurikuler" },
    ],
  },
  {
    label: "Informasi",
    href: "/informasi",
    items: [
      { label: "Berita Sekolah", href: "/informasi/berita" },
      { label: "Pengumuman", href: "/informasi/pengumuman" },
      { label: "Galeri Kegiatan", href: "/informasi/galeri" },
    ],
  },
  {
    label: "PPDB",
    href: "/ppdb",
    items: [
      { label: "Informasi PPDB", href: "/ppdb/informasi" },
      { label: "Daftar Online", href: "/ppdb/daftar" },
      { label: "Cek Status Pendaftaran", href: "/ppdb/cek-status" },
    ],
  },
  {
    label: "Layanan",
    href: "/layanan",
    items: [
      { label: "Standar Pelayanan", href: "/layanan", description: "Alur, syarat, waktu & biaya layanan" },
      { label: "Pertanyaan Ayah & Ibu", href: "/layanan/faq", description: "FAQ - sebelumnya di menu Kontak" },
    ],
  },
  {
    label: "Kontak",
    href: "/kontak",
    items: [
      { label: "Lokasi & Kontak", href: "/kontak/lokasi" },
      { label: "Buku Tamu", href: "/kontak/buku-tamu" },
    ],
  },
];

export const FOOTER_QUICK_LINKS: NavItem[] = [
  { label: "Profil Sekolah", href: "/profil/visi-misi" },
  { label: "Guru & Tendik", href: "/guru-dan-tendik" },
  { label: "Program Unggulan", href: "/akademik/program-unggulan" },
  { label: "PPDB Online", href: "/ppdb/daftar" },
  { label: "Cek Status PPDB", href: "/ppdb/cek-status" },
  { label: "Standar Pelayanan", href: "/layanan" },
  { label: "Pertanyaan Ayah & Ibu", href: "/layanan/faq" },
  { label: "Hubungi Kami", href: "/kontak/lokasi" },
];
