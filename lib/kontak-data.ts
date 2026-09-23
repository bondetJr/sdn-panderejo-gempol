import { cache } from "react";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------
// FAQ - Sekarang pakai DB, dummy hanya fallback kalau DB error/kosong
// ---------------------------------------------------------------

const DUMMY_FAQ = [
  {
    id: "dummy-faq-1",
    pertanyaan: "Bagaimana cara mendaftar PPDB secara online?",
    jawaban:
      "Bapak/Ibu dapat mendaftar melalui menu PPDB > Daftar Online. Isi formulir 5 langkah (pilih jalur, data siswa, data orang tua, unggah dokumen, lalu review) hingga selesai. Simpan nomor pendaftaran yang muncul di akhir untuk mengecek status.",
    urutan: 0,
  },
  {
    id: "dummy-faq-2",
    pertanyaan: "Berapa usia minimal untuk mendaftar SD?",
    jawaban:
      "Calon siswa wajib berusia minimal 6 tahun pada tanggal 1 Juli tahun ajaran berjalan. Anak usia 5 tahun 6 bulan dapat dipertimbangkan dengan rekomendasi psikolog jika kuota masih tersedia.",
    urutan: 1,
  },
  {
    id: "dummy-faq-3",
    pertanyaan: "Apa bedanya jalur Zonasi, Afirmasi, dan Perpindahan?",
    jawaban:
      "Zonasi berdasarkan jarak domisili ke sekolah. Afirmasi khusus untuk keluarga pemegang KIP/KKS. Perpindahan untuk anak yang mengikuti perpindahan tugas orang tua. Detail syarat masing-masing jalur bisa dilihat di menu PPDB > Informasi PPDB.",
    urutan: 2,
  },
  {
    id: "dummy-faq-4",
    pertanyaan: "Bagaimana jika ingin mengajukan pengaduan atau keluhan?",
    jawaban:
      "Bapak/Ibu dapat menyampaikan pengaduan melalui menu Kontak > Hubungi Kami, atau datang langsung ke sekolah pada jam layanan Senin-Jumat 07.30-13.00 WIB untuk bertemu langsung dengan Kepala Sekolah.",
    urutan: 3,
  },
  {
    id: "dummy-faq-5",
    pertanyaan: "Apakah sekolah menyediakan program ekstrakurikuler?",
    jawaban:
      "Ya, sekolah menyediakan berbagai ekstrakurikuler seperti Pramuka, Seni Tari, dan Futsal. Informasi lengkap jadwal dan pembina bisa dilihat di menu Akademik > Ekstrakurikuler.",
    urutan: 4,
  },
];

export const getFaqList = cache(async () => {
  try {
    const data = await prisma.faq.findMany({ orderBy: { urutan: "asc" } });
    // Kalau DB ada isinya, pakai DB. Kalau kosong, pakai dummy biar halaman tidak kosong melompong.
    // Setelah admin FAQ jadi, dummy ini otomatis tidak dipakai lagi karena DB sudah ada isinya.
    if (data.length > 0) return data;
    console.warn("[getFaqList] DB FAQ kosong, pakai dummy. Silakan isi via /admin/kontak/faq");
    return DUMMY_FAQ;
  } catch (e) {
    console.error("[getFaqList] Gagal ambil FAQ:", e);
    return DUMMY_FAQ;
  }
});

// ---------------------------------------------------------------
// TESTIMONIAL (Buku Tamu)
// ---------------------------------------------------------------

const DUMMY_TESTIMONIALS = [
  {
    id: "dummy-t1",
    nama: "Ibu Sri Wahyuni",
    peran: "Wali Murid Kelas 3A",
    pesan: "Guru-guru sangat sabar dan komunikatif. Anak saya jadi lebih semangat berangkat sekolah setiap hari.",
    rating: 5,
    createdAt: new Date(),
  },
  {
    id: "dummy-t2",
    nama: "Bapak Ahmad Fauzi",
    peran: "Wali Murid Kelas 1B",
    pesan: "Proses PPDB online sangat mudah dan jelas. Informasi statusnya juga cepat bisa dicek sendiri.",
    rating: 5,
    createdAt: new Date(Date.now() - 86400000 * 4),
  },
  {
    id: "dummy-t3",
    nama: "Ibu Dewi Lestari",
    peran: "Wali Murid Kelas 5C",
    pesan: "Program 7 Kebiasaan Anak Indonesia Hebat sangat membantu membentuk karakter anak.",
    rating: 5,
    createdAt: new Date(Date.now() - 86400000 * 8),
  },
];

export const getApprovedTestimonials = cache(async () => {
  try {
    const data = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    });
    if (data.length === 0) throw new Error("empty");
    return data;
  } catch {
    return DUMMY_TESTIMONIALS;
  }
});

export const getFeaturedTestimonials = cache(async () => {
  try {
    const data = await prisma.testimonial.findMany({
      where: { isApproved: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    if (data.length === 0) throw new Error("empty");
    return data;
  } catch {
    return DUMMY_TESTIMONIALS.slice(0, 3);
  }
});

export const getContactInfo = cache(async () => {
  try {
    const data = await prisma.school.findFirst();
    return data;
  } catch {
    return null;
  }
});
