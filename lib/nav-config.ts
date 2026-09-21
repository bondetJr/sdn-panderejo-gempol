export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  label: string;
  href?: string; // jika ada, klik label langsung menuju halaman ini
  items?: NavItem[]; // sub-menu dropdown
};

/**
 * Struktur 8 menu utama area publik.
 * Dipakai bersama oleh Header (desktop mega-menu) & MobileNav.
 */
export const NAV_CONFIG: NavGroup[] = [
  {
    label: "Beranda",
    href: "/",
  },
  {
    label: "Profil Sekolah",
    href: "/profil",
    items: [
      { label: "Visi & Misi", href: "/profil/visi-misi" },
      { label: "Sejarah", href: "/profil/sejarah" },
      { label: "Struktur Organisasi", href: "/profil/struktur-organisasi" },
      { label: "Sambutan Kepala Sekolah", href: "/profil/sambutan-kepala-sekolah" },
      { label: "Fasilitas", href: "/profil/fasilitas" },
      { label: "Akreditasi & Prestasi", href: "/profil/akreditasi-prestasi" },
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
    label: "Guru & Tendik",
    href: "/guru-dan-tendik",
  },
  {
    label: "Informasi",
    href: "/informasi",
    items: [
      { label: "Berita", href: "/informasi/berita" },
      { label: "Pengumuman", href: "/informasi/pengumuman" },
      { label: "Kegiatan Siswa", href: "/informasi/galeri" },
    ],
  },
  {
    label: "PPDB",
    href: "/ppdb",
    items: [
      { label: "Informasi PPDB", href: "/ppdb/informasi" },
      { label: "Daftar Online", href: "/ppdb/daftar" },
      { label: "Cek Status", href: "/ppdb/cek-status" },
    ],
  },
  {
    label: "Layanan",
    href: "/layanan",
  },
  {
    label: "Kontak",
    href: "/kontak",
    items: [
      { label: "Lokasi", href: "/kontak/lokasi" },
      { label: "Hubungi Kami", href: "/kontak/hubungi-kami" },
      { label: "Buku Tamu", href: "/kontak/buku-tamu" },
      { label: "FAQ", href: "/kontak/faq" },
    ],
  },
];

export const FOOTER_QUICK_LINKS: NavItem[] = [
  { label: "Profil Sekolah", href: "/kenali-sekolah" },
  { label: "Standar Pelayanan", href: "/layanan" },
  { label: "PPDB Online", href: "/ppdb/daftar" },
  { label: "Cek Status PPDB", href: "/ppdb/cek-status" },
  { label: "Standar Pelayanan", href: "/layanan" },
  { label: "Berita Terbaru", href: "/informasi/berita" },
  { label: "Kegiatan Siswa", href: "/informasi/galeri" },
  { label: "Hubungi Kami", href: "/kontak/hubungi-kami" },
];
