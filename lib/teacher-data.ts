import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type TeacherCard = {
  id: string;
  nama: string;
  nip: string | null;
  nuptk: string | null;
  jabatan: string;
  statusKepegawaian: "PNS" | "PPPK" | "HONORER";
  jenisKelamin: "L" | "P" | null;
  fotoUrl: string | null;
  mapelDiampu: string | null;
  isKepalaSekolah: boolean;
};

export const getAllTeachers = cache(async (): Promise<TeacherCard[]> => {
  try {
    const data = await prisma.teacher.findMany({
      where: { isActive: true },
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
    });
    if (data.length === 0) throw new Error("empty");
    return data.map((t) => ({
      id: t.id,
      nama: t.nama,
      nip: t.nip,
      nuptk: t.nuptk,
      jabatan: t.jabatan,
      statusKepegawaian: t.statusKepegawaian,
      jenisKelamin: t.jenisKelamin,
      fotoUrl: t.fotoUrl,
      mapelDiampu: t.mapelDiampu,
      isKepalaSekolah: t.isKepalaSekolah,
    }));
  } catch {
    return [
      {
        id: "dummy-1",
        nama: "[NAMA KEPALA SEKOLAH]",
        nip: "[NIP]",
        nuptk: null,
        jabatan: "Kepala Sekolah",
        statusKepegawaian: "PNS",
        jenisKelamin: "P",
        fotoUrl: null,
        mapelDiampu: null,
        isKepalaSekolah: true,
      },
      {
        id: "dummy-2",
        nama: "Siti Aminah, S.Pd.",
        nip: "198501012010012001",
        nuptk: null,
        jabatan: "Guru Kelas 1",
        statusKepegawaian: "PNS",
        jenisKelamin: "P",
        fotoUrl: null,
        mapelDiampu: "Guru Kelas",
        isKepalaSekolah: false,
      },
      {
        id: "dummy-3",
        nama: "Ahmad Yusuf, S.Pd.",
        nip: null,
        nuptk: "1234567890123456",
        jabatan: "Guru Kelas 2",
        statusKepegawaian: "PPPK",
        jenisKelamin: "L",
        fotoUrl: null,
        mapelDiampu: "Guru Kelas",
        isKepalaSekolah: false,
      },
      {
        id: "dummy-4",
        nama: "Ratna Dewi, S.Pd.",
        nip: "198703152011012002",
        nuptk: null,
        jabatan: "Guru Kelas 3",
        statusKepegawaian: "PNS",
        jenisKelamin: "P",
        fotoUrl: null,
        mapelDiampu: "Guru Kelas",
        isKepalaSekolah: false,
      },
      {
        id: "dummy-5",
        nama: "Bagus Prasetyo, S.Pd.",
        nip: null,
        nuptk: "2234567890123456",
        jabatan: "Guru Kelas 4",
        statusKepegawaian: "PPPK",
        jenisKelamin: "L",
        fotoUrl: null,
        mapelDiampu: "Guru Kelas",
        isKepalaSekolah: false,
      },
      {
        id: "dummy-6",
        nama: "Dwi Kurniawati, S.Pd.",
        nip: null,
        nuptk: null,
        jabatan: "Guru Kelas 5",
        statusKepegawaian: "HONORER",
        jenisKelamin: "P",
        fotoUrl: null,
        mapelDiampu: "Guru Kelas",
        isKepalaSekolah: false,
      },
      {
        id: "dummy-7",
        nama: "Slamet Riyadi, S.Pd.",
        nip: "197911052008011003",
        nuptk: null,
        jabatan: "Guru Kelas 6",
        statusKepegawaian: "PNS",
        jenisKelamin: "L",
        fotoUrl: null,
        mapelDiampu: "Guru Kelas",
        isKepalaSekolah: false,
      },
      {
        id: "dummy-8",
        nama: "Muhammad Fauzi, S.Pd.I.",
        nip: null,
        nuptk: "3234567890123456",
        jabatan: "Guru PAI",
        statusKepegawaian: "PPPK",
        jenisKelamin: "L",
        fotoUrl: null,
        mapelDiampu: "Pendidikan Agama Islam",
        isKepalaSekolah: false,
      },
      {
        id: "dummy-9",
        nama: "Agus Setiawan, S.Pd.",
        nip: null,
        nuptk: null,
        jabatan: "Guru PJOK",
        statusKepegawaian: "HONORER",
        jenisKelamin: "L",
        fotoUrl: null,
        mapelDiampu: "PJOK",
        isKepalaSekolah: false,
      },
      {
        id: "dummy-10",
        nama: "Indah Permatasari",
        nip: null,
        nuptk: null,
        jabatan: "Operator Sekolah / Tata Usaha",
        statusKepegawaian: "HONORER",
        jenisKelamin: "P",
        fotoUrl: null,
        mapelDiampu: null,
        isKepalaSekolah: false,
      },
    ];
  }
});
