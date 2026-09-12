import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Semua fungsi di bawah dibungkus try/catch dengan fallback data
 * dummy. Ini supaya halaman Beranda tetap enak dilihat saat
 * development awal (sebelum `npm run prisma:seed` dijalankan),
 * dan tidak crash kalau koneksi DB sedang bermasalah.
 * Setelah database terisi, data asli otomatis dipakai.
 */

export const getPengumumanPenting = cache(async () => {
  try {
    return await prisma.announcement.findMany({
      where: { isPenting: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
  } catch {
    return [
      {
        id: "dummy-1",
        title: "Pendaftaran PPDB 2026/2027 Telah Dibuka",
        content:
          "Pendaftaran Peserta Didik Baru Tahun Ajaran 2026/2027 sudah dibuka melalui jalur Zonasi, Afirmasi, dan Perpindahan Orang Tua.",
        isPenting: true,
        publishedAt: new Date(),
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
});

export const getFasilitasUnggulan = cache(async () => {
  try {
    const data = await prisma.facility.findMany({
      where: { isPublished: true },
      orderBy: { urutan: "asc" },
      take: 4,
    });
    if (data.length > 0) return data;
    throw new Error("empty");
  } catch {
    return [
      {
        id: "dummy-perpus",
        nama: "Perpustakaan",
        deskripsi:
          "Ruang baca nyaman dengan koleksi buku cerita, pelajaran, dan referensi untuk menumbuhkan minat baca siswa.",
        gambarUrl:
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
        icon: "BookOpen",
        urutan: 1,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-uks",
        nama: "UKS",
        deskripsi:
          "Unit Kesehatan Sekolah dengan fasilitas P3K lengkap untuk penanganan pertama siswa yang sakit di sekolah.",
        gambarUrl:
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
        icon: "HeartPulse",
        urutan: 2,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-lab",
        nama: "Laboratorium Komputer",
        deskripsi:
          "Ruang komputer untuk mengenalkan literasi digital dan Asesmen Nasional Berbasis Komputer (ANBK).",
        gambarUrl:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
        icon: "Monitor",
        urutan: 3,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-lapangan",
        nama: "Lapangan Olahraga",
        deskripsi:
          "Lapangan multifungsi untuk kegiatan olahraga, upacara bendera, dan kegiatan outdoor lainnya.",
        gambarUrl:
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
        icon: "Dumbbell",
        urutan: 4,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
});

export const getBeritaTerbaru = cache(async () => {
  try {
    const data = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
    if (data.length > 0) return data;
    throw new Error("empty");
  } catch {
    return [
      {
        id: "dummy-news-1",
        title: "Kegiatan Jumat Bersih Tumbuhkan Kepedulian Lingkungan",
        slug: "kegiatan-jumat-bersih",
        excerpt:
          "Siswa-siswi SDN Panderejo Gempol antusias mengikuti kegiatan kerja bakti membersihkan lingkungan sekolah.",
        content: "",
        coverImageUrl:
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
        status: "PUBLISHED" as const,
        publishedAt: new Date(),
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-news-2",
        title: "Juara 1 Lomba Cerdas Cermat Tingkat Kecamatan Gempol",
        slug: "juara-cerdas-cermat",
        excerpt:
          "Tim SDN Panderejo Gempol berhasil meraih juara 1 dalam Lomba Cerdas Cermat tingkat Kecamatan Gempol.",
        content: "",
        coverImageUrl:
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
        status: "PUBLISHED" as const,
        publishedAt: new Date(),
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-news-3",
        title: "Workshop Penguatan Kurikulum Merdeka untuk Guru",
        slug: "workshop-kurikulum-merdeka",
        excerpt:
          "Seluruh dewan guru mengikuti workshop penguatan implementasi Kurikulum Merdeka di sekolah.",
        content: "",
        coverImageUrl:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
        status: "PUBLISHED" as const,
        publishedAt: new Date(),
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
});

export const getTestimoniUnggulan = cache(async () => {
  try {
    const data = await prisma.testimonial.findMany({
      where: { isFeatured: true, isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    if (data.length > 0) return data;
    throw new Error("empty");
  } catch {
    return [
      {
        id: "dummy-t1",
        nama: "Ibu Sri Wahyuni",
        peran: "Wali Murid Kelas 3A",
        pesan:
          "Guru-guru sangat sabar dan komunikatif. Anak saya jadi lebih semangat berangkat sekolah setiap hari.",
        rating: 5,
        fotoUrl: null,
        isFeatured: true,
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-t2",
        nama: "Bapak Ahmad Fauzi",
        peran: "Wali Murid Kelas 1B",
        pesan:
          "Proses PPDB online sangat mudah dan jelas. Informasi statusnya juga cepat bisa dicek sendiri.",
        rating: 5,
        fotoUrl: null,
        isFeatured: true,
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-t3",
        nama: "Ibu Dewi Lestari",
        peran: "Wali Murid Kelas 5C",
        pesan:
          "Program 7 Kebiasaan Anak Indonesia Hebat benar-benar terasa dampaknya pada kedisiplinan anak saya di rumah.",
        rating: 5,
        fotoUrl: null,
        isFeatured: true,
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
});

export const getPpdbAktif = cache(async () => {
  try {
    const wave = await prisma.ppdbWave.findFirst({
      where: { isActive: true },
      orderBy: { tanggalBuka: "desc" },
    });
    return wave;
  } catch {
    return {
      id: "dummy-wave",
      tahunAjaran: "2026/2027",
      jalur: "ZONASI" as const,
      kuota: 32,
      kuotaTerisi: 12,
      syaratText: "",
      tanggalBuka: new Date(),
      tanggalTutup: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
});
