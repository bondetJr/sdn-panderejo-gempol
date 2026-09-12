import { cache } from "react";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------
// BERITA
// ---------------------------------------------------------------

const DUMMY_NEWS = [
  {
    id: "dummy-news-1",
    title: "Kegiatan Jumat Bersih Tumbuhkan Kepedulian Lingkungan",
    slug: "kegiatan-jumat-bersih",
    excerpt:
      "Siswa-siswi SDN Panderejo Gempol antusias mengikuti kegiatan kerja bakti membersihkan lingkungan sekolah.",
    content:
      "Setiap hari Jumat pagi, seluruh warga sekolah SDN Panderejo Gempol melaksanakan kegiatan Jumat Bersih sebagai bagian dari Program Lingkungan Sehat Berbudaya Bersih.\n\nKegiatan ini melibatkan seluruh siswa dari kelas 1 hingga kelas 6, didampingi oleh guru dan tenaga kependidikan. Siswa dibagi ke dalam kelompok-kelompok kecil untuk membersihkan area kelas, halaman, dan taman sekolah.\n\nMelalui kegiatan rutin ini, diharapkan siswa dapat menumbuhkan rasa cinta dan peduli terhadap kebersihan lingkungan sejak dini, sekaligus melatih kerja sama dan tanggung jawab bersama.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
    publishedAt: new Date(),
  },
  {
    id: "dummy-news-2",
    title: "Juara 1 Lomba Cerdas Cermat Tingkat Kecamatan Gempol",
    slug: "juara-cerdas-cermat",
    excerpt:
      "Tim SDN Panderejo Gempol berhasil meraih juara 1 dalam Lomba Cerdas Cermat tingkat Kecamatan Gempol.",
    content:
      "Prestasi membanggakan kembali ditorehkan oleh siswa-siswi SDN Panderejo Gempol. Tim Cerdas Cermat sekolah berhasil meraih Juara 1 dalam ajang Lomba Cerdas Cermat (LCC) tingkat Kecamatan Gempol yang diselenggarakan oleh Korwil Pendidikan Kecamatan Gempol.\n\nTim yang terdiri dari 3 siswa terbaik ini telah melalui proses seleksi dan pembinaan intensif selama satu bulan sebelum mengikuti perlombaan. Kerja keras dan bimbingan dari guru pembina membuahkan hasil yang membanggakan.\n\nPrestasi ini menjadi bukti nyata keberhasilan Program Prestasi Akademik & Non-Akademik yang terus digalakkan oleh sekolah.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80",
    publishedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: "dummy-news-3",
    title: "Workshop Penguatan Kurikulum Merdeka untuk Guru",
    slug: "workshop-kurikulum-merdeka",
    excerpt:
      "Seluruh dewan guru mengikuti workshop penguatan implementasi Kurikulum Merdeka di sekolah.",
    content:
      "Dalam rangka meningkatkan kualitas pembelajaran, seluruh dewan guru SDN Panderejo Gempol mengikuti workshop penguatan implementasi Kurikulum Merdeka yang diselenggarakan di aula sekolah.\n\nWorkshop ini membahas berbagai aspek penting, mulai dari perancangan modul ajar, asesmen pembelajaran, hingga strategi Projek Penguatan Profil Pelajar Pancasila (P5).\n\nDengan adanya kegiatan ini, diharapkan seluruh guru semakin siap dan kompeten dalam menerapkan Kurikulum Merdeka secara optimal demi kualitas pendidikan yang lebih baik.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
    publishedAt: new Date(Date.now() - 86400000 * 12),
  },
];

export const getAllNews = cache(async () => {
  try {
    const data = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    });
    if (data.length === 0) throw new Error("empty");
    return data;
  } catch {
    return DUMMY_NEWS;
  }
});

export const getNewsBySlug = cache(async (slug: string) => {
  try {
    const data = await prisma.news.findUnique({ where: { slug } });
    if (!data) throw new Error("empty");
    return data;
  } catch {
    return DUMMY_NEWS.find((n) => n.slug === slug) ?? null;
  }
});

// ---------------------------------------------------------------
// PENGUMUMAN
// ---------------------------------------------------------------

const DUMMY_ANNOUNCEMENTS = [
  {
    id: "dummy-ann-1",
    title: "Pendaftaran PPDB 2026/2027 Telah Dibuka",
    content:
      "Pendaftaran Peserta Didik Baru Tahun Ajaran 2026/2027 sudah dibuka melalui jalur Zonasi, Afirmasi, dan Perpindahan Orang Tua. Silakan kunjungi menu PPDB untuk informasi lengkap dan pendaftaran online.",
    isPenting: true,
    publishedAt: new Date(),
  },
  {
    id: "dummy-ann-2",
    title: "Jadwal Penilaian Tengah Semester Ganjil",
    content:
      "Penilaian Tengah Semester (PTS) Ganjil akan dilaksanakan sesuai jadwal pada Kalender Akademik. Mohon siswa mempersiapkan diri dengan baik.",
    isPenting: true,
    publishedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: "dummy-ann-3",
    title: "Pengumpulan Berkas Bantuan Siswa Miskin (BSM)",
    content:
      "Bagi wali murid yang ingin mengajukan Bantuan Siswa Miskin, mohon mengumpulkan berkas persyaratan ke operator sekolah paling lambat akhir bulan ini.",
    isPenting: false,
    publishedAt: new Date(Date.now() - 86400000 * 8),
  },
];

export const getAllAnnouncements = cache(async () => {
  try {
    const data = await prisma.announcement.findMany({
      orderBy: [{ isPenting: "desc" }, { publishedAt: "desc" }],
    });
    if (data.length === 0) throw new Error("empty");
    return data;
  } catch {
    return DUMMY_ANNOUNCEMENTS;
  }
});

// ---------------------------------------------------------------
// GALERI
// ---------------------------------------------------------------

const DUMMY_ALBUMS = [
  {
    id: "dummy-album-1",
    judul: "Perayaan Hari Kemerdekaan RI",
    deskripsi: "Dokumentasi kegiatan upacara dan lomba 17 Agustus.",
    coverUrl:
      "https://images.unsplash.com/photo-1541417904950-b855846fe074?w=800&q=80",
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1000&q=80", caption: "Upacara bendera" },
      { id: "p2", url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000&q=80", caption: "Lomba tarik tambang" },
      { id: "p3", url: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=1000&q=80", caption: "Pembagian hadiah" },
    ],
  },
  {
    id: "dummy-album-2",
    judul: "Kegiatan Belajar di Perpustakaan",
    deskripsi: "Momen siswa membaca dan berkegiatan di perpustakaan sekolah.",
    coverUrl:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
    photos: [
      { id: "p4", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1000&q=80", caption: "Membaca bersama" },
      { id: "p5", url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1000&q=80", caption: "Rak buku" },
    ],
  },
  {
    id: "dummy-album-3",
    judul: "Wisuda & Perpisahan Kelas 6",
    deskripsi: "Momen haru pelepasan siswa kelas 6 tahun ajaran lalu.",
    coverUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    photos: [
      { id: "p6", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&q=80", caption: "Prosesi wisuda" },
      { id: "p7", url: "https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?w=1000&q=80", caption: "Foto bersama" },
      { id: "p8", url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&q=80", caption: "Penyerahan ijazah" },
    ],
  },
];

export const getAllGalleryAlbums = cache(async () => {
  try {
    const data = await prisma.galleryAlbum.findMany({
      include: { photos: { orderBy: { urutan: "asc" }, take: 1 }, _count: { select: { photos: true } } },
      orderBy: { createdAt: "desc" },
    });
    if (data.length === 0) throw new Error("empty");
    return data.map((a) => ({
      id: a.id,
      judul: a.judul,
      deskripsi: a.deskripsi,
      coverUrl: a.coverUrl ?? a.photos[0]?.url ?? null,
      jumlahFoto: a._count.photos,
    }));
  } catch {
    return DUMMY_ALBUMS.map((a) => ({
      id: a.id,
      judul: a.judul,
      deskripsi: a.deskripsi,
      coverUrl: a.coverUrl,
      jumlahFoto: a.photos.length,
    }));
  }
});

export const getGalleryAlbumById = cache(async (id: string) => {
  try {
    const data = await prisma.galleryAlbum.findUnique({
      where: { id },
      include: { photos: { orderBy: { urutan: "asc" } } },
    });
    if (!data) throw new Error("empty");
    return data;
  } catch {
    return DUMMY_ALBUMS.find((a) => a.id === id) ?? null;
  }
});
