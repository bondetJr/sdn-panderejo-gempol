import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getAgenda, getExtracurriculars, getRombonganBelajarPublic } from "@/lib/academic-data";
import { getAllNews, getAllAnnouncements, getAllGalleryAlbums } from "@/lib/informasi-data";
import { getApprovedTestimonials } from "@/lib/kontak-data";
import { getFlagshipPrograms } from "@/lib/program-unggulan-data";
import { getAchievements, getFasilitasAll, getKepalaSekolah } from "@/lib/profil-data";
import { getSchoolProfile } from "@/lib/school";
import { getAllTeachers } from "@/lib/teacher-data";
import { getStrukturOrganisasi } from "@/lib/struktur-data";

const DEFAULT_VISI =
  "Terwujudnya peserta didik yang religius, berakhlak mulia, cerdas, mandiri, dan peduli lingkungan.";
const DEFAULT_MISI = [
  "Menanamkan nilai-nilai keagamaan dan akhlak mulia dalam kehidupan sehari-hari.",
  "Menyelenggarakan pembelajaran yang aktif, kreatif, efektif, dan menyenangkan.",
  "Mengembangkan budaya literasi dan numerasi sejak dini.",
  "Membiasakan pola hidup bersih, sehat, dan peduli terhadap lingkungan.",
  "Mengembangkan potensi peserta didik di bidang akademik maupun non-akademik.",
  "Membangun kerja sama yang baik antara sekolah, orang tua, dan masyarakat.",
];
const DEFAULT_KURIKULUM =
  "SD Negeri Panderejo Gempol menerapkan Kurikulum Merdeka yang berpusat pada peserta didik, berbasis proyek, fleksibel, dan menguatkan karakter melalui Profil Pelajar Pancasila.";

function tanpaPpdb<T extends { title?: string; content?: string; pertanyaan?: string; jawaban?: string }>(
  item: T
) {
  const text = `${item.title ?? ""} ${item.content ?? ""} ${item.pertanyaan ?? ""} ${item.jawaban ?? ""}`;
  return !/ppdb|peserta didik baru/i.test(text);
}

async function getSchoolNarratives() {
  try {
    const school = await prisma.school.findFirst({
      select: { visi: true, misi: true, sejarah: true, kurikulumText: true },
    });
    return {
      visi: school?.visi || DEFAULT_VISI,
      misi: school?.misi?.split("\n").filter(Boolean) || DEFAULT_MISI,
      sejarah: school?.sejarah || "Perjalanan sejarah sekolah akan dilengkapi melalui Dashboard Admin.",
      kurikulum: school?.kurikulumText || DEFAULT_KURIKULUM,
    };
  } catch {
    return { visi: DEFAULT_VISI, misi: DEFAULT_MISI, sejarah: "Perjalanan sejarah sekolah akan dilengkapi melalui Dashboard Admin.", kurikulum: DEFAULT_KURIKULUM };
  }
}

export const getKenaliSekolahData = cache(async () => {
  const [school, narratives, programs, facilities, achievements, principal, teachers, structure, classes, extracurriculars, agenda, news, announcements, albums, testimonials] =
    await Promise.all([
      getSchoolProfile(),
      getSchoolNarratives(),
      getFlagshipPrograms(),
      getFasilitasAll(),
      getAchievements(),
      getKepalaSekolah(),
      getAllTeachers(),
      getStrukturOrganisasi(),
      getRombonganBelajarPublic(),
      getExtracurriculars(),
      getAgenda(),
      getAllNews(),
      getAllAnnouncements(),
      getAllGalleryAlbums(),
      getApprovedTestimonials(),
    ]);

  return {
    school,
    narratives,
    programs,
    facilities,
    achievements,
    principal: { nama: principal.nama, jabatan: principal.jabatan, fotoUrl: principal.fotoUrl },
    teachers: teachers.map(({ id, nama, jabatan, fotoUrl, mapelDiampu }) => ({ id, nama, jabatan, fotoUrl, mapelDiampu })),
    structure: {
      committee: structure.komite.map(({ id, nama, jabatan }) => ({ id, nama, jabatan })),
      guruCount: structure.guru.length,
      tendikCount: structure.tendik.length,
    },
    classes: classes.map(({ id, nama, tingkat, waliKelasNama, jumlahSiswa }) => ({
      id, nama, tingkat, waliKelasNama, jumlahSiswa,
    })),
    extracurriculars: extracurriculars.map(({ id, nama, deskripsi, jadwal, fotoUrl, pembina }) => ({
      id, nama, deskripsi, jadwal, fotoUrl, pembinaNama: pembina?.nama ?? null,
    })),
    agenda: agenda.slice(0, 6).map(({ id, judul, deskripsi, tanggalMulai, kategori }) => ({
      id, judul, deskripsi, tanggal: tanggalMulai.toISOString(), kategori,
    })),
    news: news.filter(tanpaPpdb).slice(0, 6).map(({ id, title, excerpt, slug, coverImageUrl, publishedAt }) => ({
      id, title, excerpt, slug, coverImageUrl, tanggal: publishedAt.toISOString(),
    })),
    announcements: announcements.filter(tanpaPpdb).slice(0, 6).map(({ id, title, content, publishedAt }) => ({
      id, title, content, tanggal: publishedAt.toISOString(),
    })),
    albums,
    testimonials: testimonials.filter(tanpaPpdb).slice(0, 6).map(({ id, nama, peran, pesan, rating }) => ({
      id, nama, peran, pesan, rating,
    })),
  };
});

export type KenaliSekolahData = Awaited<ReturnType<typeof getKenaliSekolahData>>;
