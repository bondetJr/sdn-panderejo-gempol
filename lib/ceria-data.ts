import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSchoolProfile, type SchoolProfile } from "@/lib/school";
import { getAllTeachers } from "@/lib/teacher-data";
import { getFasilitasAll, getAchievements, getKepalaSekolah } from "@/lib/profil-data";
import { getFlagshipPrograms } from "@/lib/program-unggulan-data";
import { getExtracurriculars, getAgenda, getRombonganBelajarPublic } from "@/lib/academic-data";
import { getJadwalPelajaranAll } from "@/lib/jadwal-data";
import { getAllNews, getAllAnnouncements } from "@/lib/informasi-data";
import { getServiceStandards } from "@/lib/layanan-data";
import { getFaqList } from "@/lib/kontak-data";

type TeacherLite = Awaited<ReturnType<typeof getAllTeachers>>[number];
type FacilityLite = Awaited<ReturnType<typeof getFasilitasAll>>[number];
type AchievementLite = Awaited<ReturnType<typeof getAchievements>>[number];
type ProgramLite = Awaited<ReturnType<typeof getFlagshipPrograms>>[number];
type EkskulLite = Awaited<ReturnType<typeof getExtracurriculars>>[number];
type AgendaLite = Awaited<ReturnType<typeof getAgenda>>[number];
type ClassLite = Awaited<ReturnType<typeof getRombonganBelajarPublic>>[number];
type NewsLite = Awaited<ReturnType<typeof getAllNews>>[number];
type AnnouncementLite = Awaited<ReturnType<typeof getAllAnnouncements>>[number];
type LayananLite = Awaited<ReturnType<typeof getServiceStandards>>[number];
type FaqLite = Awaited<ReturnType<typeof getFaqList>>[number];
type PpdbWaveLite = { jalur: string; tahunAjaran: string; kuota: number; syaratText: string | null };

export const getCeriaCompleteData = cache(async () => {
  try {
    const [
      schoolProfile,
      teachers,
      facilities,
      achievements,
      programs,
      extracurriculars,
      agenda,
      classes,
      jadwal,
      news,
      announcements,
      layanan,
      faqs,
      kepalaSekolah,
      ppdbWaves,
      totalSiswa,
      totalRombel,
    ] = await Promise.all([
      getSchoolProfile().catch(() => null as SchoolProfile | null),
      getAllTeachers().catch(() => [] as TeacherLite[]),
      getFasilitasAll().catch(() => [] as FacilityLite[]),
      getAchievements().catch(() => [] as AchievementLite[]),
      getFlagshipPrograms().catch(() => [] as ProgramLite[]),
      getExtracurriculars().catch(() => [] as EkskulLite[]),
      getAgenda().catch(() => [] as AgendaLite[]),
      getRombonganBelajarPublic().catch(() => [] as ClassLite[]),
      getJadwalPelajaranAll().catch(() => ({}) as Record<number, { hari: string; slots: { jamKe: number; waktu: string; subjectId: string }[] }[]>),
      getAllNews().catch(() => [] as NewsLite[]),
      getAllAnnouncements().catch(() => [] as AnnouncementLite[]),
      getServiceStandards().catch(() => [] as LayananLite[]),
      getFaqList().catch(() => [] as FaqLite[]),
      getKepalaSekolah().catch(() => null),
      prisma.ppdbWave.findMany({ where: { isActive: true }, orderBy: { jalur: "asc" } }).catch(() => [] as PpdbWaveLite[]),
      prisma.student.count({ where: { isActive: true } }).catch(() => 0),
      prisma.classRoom.count().catch(() => 0),
    ]);

    const totalSiswaFromClasses = classes.reduce((sum, c) => sum + c.jumlahSiswa, 0);
    const totalLaki = classes.reduce((sum, c) => sum + c.jumlahLakiLaki, 0);
    const totalPerempuan = classes.reduce((sum, c) => sum + c.jumlahPerempuan, 0);

    const isTendik = (jabatan: string): boolean => {
      const j = jabatan.toLowerCase();
      return j.includes("tata usaha") || j.includes("operator") || j.includes("administrasi") || j.includes("tendik");
    };

    return {
      profil: schoolProfile
        ? {
            nama: schoolProfile.nama,
            npsn: schoolProfile.npsn,
            alamat: schoolProfile.alamat,
            telepon: schoolProfile.telepon,
            email: schoolProfile.email,
            akreditasi: schoolProfile.akreditasi,
            akreditasiTahun: schoolProfile.akreditasiTahun,
            tahunAjaranAktif: schoolProfile.tahunAjaranAktif,
            jamLayanan: schoolProfile.jamLayanan,
            visi: schoolProfile.visi,
            misi: schoolProfile.misi,
            sejarah: schoolProfile.sejarah,
            kurikulumText: schoolProfile.kurikulumText,
            desa: schoolProfile.desa,
            kecamatan: schoolProfile.kecamatan,
            kabupaten: schoolProfile.kabupaten,
          }
        : null,
      kepalaSekolah: kepalaSekolah ? { nama: kepalaSekolah.nama, jabatan: kepalaSekolah.jabatan } : null,
      statistik: {
        totalRombel: totalRombel || classes.length,
        totalSiswa: totalSiswa || totalSiswaFromClasses,
        totalSiswaLaki: totalLaki,
        totalSiswaPerempuan: totalPerempuan,
        totalGuru: teachers.filter((t) => !isTendik(t.jabatan)).length,
        totalTendik: teachers.filter((t) => isTendik(t.jabatan)).length,
        totalGuruTendik: teachers.length,
      },
      rombel: classes.map((c) => ({
        nama: c.nama,
        tingkat: c.tingkat,
        waliKelas: c.waliKelasNama,
        jumlahSiswa: c.jumlahSiswa,
        laki: c.jumlahLakiLaki,
        perempuan: c.jumlahPerempuan,
      })),
      programUnggulan: programs.map((p) => ({
        nama: p.nama,
        deskripsi: (p.deskripsiSingkat || p.deskripsiLengkap || "").slice(0, 200),
      })),
      prestasi: achievements.map((a) => ({
        judul: a.judul,
        tingkat: a.tingkat,
        tahun: a.tahun,
        atasNama: a.atasNamaSiswa,
      })),
      kalenderAkademik: agenda.slice(0, 15).map((a) => ({
        judul: a.judul,
        tanggal: a.tanggalMulai,
        kategori: a.kategori,
      })),
      jadwalPelajaran: jadwal,
      ekstrakurikuler: extracurriculars.map((e) => ({
        nama: e.nama,
        jadwal: e.jadwal,
        pembina: e.pembina?.nama ?? null,
      })),
      fasilitas: facilities.map((f) => ({
        nama: f.nama,
        deskripsi: f.deskripsi ? f.deskripsi.slice(0, 120) : "",
      })),
      berita: news.slice(0, 5).map((n) => ({
        title: n.title,
        tanggal: n.publishedAt,
      })),
      pengumuman: announcements.slice(0, 5).map((a) => ({
        title: a.title,
        penting: a.isPenting,
      })),
      layanan: layanan.map((l) => ({
        nama: l.nama,
        waktu: l.waktuPelayanan,
        biaya: l.biaya,
      })),
      faq: faqs.slice(0, 10).map((f) => ({
        pertanyaan: f.pertanyaan,
        jawaban: f.jawaban.slice(0, 200),
      })),
      ppdb: ppdbWaves.map((w) => ({
        jalur: w.jalur,
        tahunAjaran: w.tahunAjaran,
        kuota: w.kuota,
        syarat: w.syaratText ? w.syaratText.slice(0, 200) : null,
      })),
    };
  } catch (e) {
    console.error("[getCeriaCompleteData] error:", e);
    return null;
  }
});
