import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type FaqItem = {
  id: string;
  pertanyaan: string;
  jawaban: string;
  urutan: number;
};

const DUMMY_FAQ: FaqItem[] = [
  {
    id: "dummy-faq-1",
    pertanyaan: "Bagaimana cara mendaftar PPDB secara online?",
    jawaban: "Bapak/Ibu dapat mendaftar melalui menu PPDB > Daftar Online. Isi formulir 5 langkah hingga selesai. Simpan nomor pendaftaran untuk cek status.",
    urutan: 0,
  },
  {
    id: "dummy-faq-2",
    pertanyaan: "Berapa usia minimal untuk mendaftar SD?",
    jawaban: "Calon siswa wajib berusia minimal 6 tahun pada 1 Juli tahun ajaran berjalan.",
    urutan: 1,
  },
];

export const getFaqList = cache(async (): Promise<FaqItem[]> => {
  try {
    const data = await prisma.faq.findMany({ orderBy: { urutan: "asc" } });
    if (data.length > 0) {
      console.log(`[getFaqList] Found ${data.length} FAQ from DB`);
      return data;
    }
    console.warn("[getFaqList] DB FAQ kosong, pakai dummy. Isi via /admin/layanan/faq atau /admin/kontak/faq");
    return DUMMY_FAQ;
  } catch (e) {
    console.error("[getFaqList] Gagal ambil FAQ, fallback dummy:", e);
    return DUMMY_FAQ;
  }
});

// Admin version - return real DB only, no dummy
export const getFaqListAdmin = cache(async (): Promise<FaqItem[]> => {
  try {
    const data = await prisma.faq.findMany({ orderBy: [{ urutan: "asc" }, { createdAt: "asc" }] });
    return data;
  } catch (e) {
    console.error("[getFaqListAdmin] Gagal:", e);
    return [];
  }
});

const DUMMY_TESTIMONIALS = [
  {
    id: "dummy-t1",
    nama: "Ibu Sri Wahyuni",
    peran: "Wali Murid Kelas 3A",
    pesan: "Guru-guru sangat sabar dan komunikatif.",
    rating: 5,
    createdAt: new Date(),
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
