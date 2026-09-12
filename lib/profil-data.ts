import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getKepalaSekolah = cache(async () => {
  try {
    const data = await prisma.teacher.findFirst({
      where: { isKepalaSekolah: true, isActive: true },
    });
    if (data) return data;
    throw new Error("empty");
  } catch {
    return {
      id: "dummy-kepsek",
      nama: "[NAMA KEPALA SEKOLAH]",
      nip: "[NIP KEPALA SEKOLAH]",
      nuptk: null,
      jabatan: "Kepala Sekolah",
      statusKepegawaian: "PNS" as const,
      isKepalaSekolah: true,
      fotoUrl: null,
      sambutanText:
        "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nPuji syukur kami panjatkan kehadirat Allah SWT atas segala rahmat dan karunia-Nya sehingga SD Negeri Panderejo Gempol dapat terus berkomitmen memberikan layanan pendidikan terbaik bagi putra-putri Bapak/Ibu.\n\nKami berupaya membentuk generasi yang religius, berakhlak mulia, cerdas, dan berkarakter melalui berbagai program unggulan sekolah. Dukungan dan kerja sama dari Bapak/Ibu wali murid sangat berarti bagi keberhasilan pendidikan anak-anak kita.\n\nSemoga website ini dapat menjadi jembatan informasi yang bermanfaat. Terima kasih atas kepercayaan Bapak/Ibu kepada kami.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.",
      mapelDiampu: null,
      tanggalMasuk: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
});

export const getFasilitasAll = cache(async () => {
  try {
    const data = await prisma.facility.findMany({
      where: { isPublished: true },
      orderBy: { urutan: "asc" },
    });
    if (data.length > 0) return data;
    throw new Error("empty");
  } catch {
    const { getFasilitasUnggulan } = await import("@/lib/homepage-data");
    return getFasilitasUnggulan();
  }
});

export const getAchievements = cache(async () => {
  try {
    const data = await prisma.achievement.findMany({
      orderBy: [{ tahun: "desc" }],
    });
    if (data.length > 0) return data;
    throw new Error("empty");
  } catch {
    return [
      {
        id: "dummy-a1",
        judul: "Juara 1 Lomba Cerdas Cermat SD",
        tingkat: "KECAMATAN" as const,
        tahun: 2025,
        deskripsi: null,
        fotoUrl: null,
        atasNamaSiswa: "Tim CCA SDN Panderejo Gempol",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-a2",
        judul: "Juara 2 Lomba Mewarnai Tingkat Kabupaten",
        tingkat: "KABUPATEN" as const,
        tahun: 2025,
        deskripsi: null,
        fotoUrl: null,
        atasNamaSiswa: "Ananda Siswa Kelas 2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-a3",
        judul: "Sekolah Adiwiyata Tingkat Kecamatan",
        tingkat: "KECAMATAN" as const,
        tahun: 2024,
        deskripsi: "Penghargaan atas pengelolaan lingkungan sekolah yang baik.",
        fotoUrl: null,
        atasNamaSiswa: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
});

export const TINGKAT_LABEL: Record<string, string> = {
  SEKOLAH: "Tingkat Sekolah",
  KECAMATAN: "Tingkat Kecamatan",
  KABUPATEN: "Tingkat Kabupaten",
  PROVINSI: "Tingkat Provinsi",
  NASIONAL: "Tingkat Nasional",
};
