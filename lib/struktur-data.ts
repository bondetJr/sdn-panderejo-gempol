import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type OrgPerson = {
  id: string;
  nama: string;
  jabatan: string;
  fotoUrl: string | null;
};

export type StrukturOrganisasi = {
  kepalaSekolah: OrgPerson | null;
  komite: OrgPerson[];
  guru: OrgPerson[];
  tendik: OrgPerson[];
};

/** Sama seperti klasifikasi di TeacherGrid: jabatan mengandung "guru" -> guru, sisanya tendik. */
function classify(jabatan: string): "guru" | "tendik" {
  return jabatan.toLowerCase().includes("guru") ? "guru" : "tendik";
}

export const getStrukturOrganisasi = cache(
  async (): Promise<StrukturOrganisasi> => {
    try {
      const [teachers, komite] = await Promise.all([
        prisma.teacher.findMany({
          where: { isActive: true },
          orderBy: [{ urutan: "asc" }, { nama: "asc" }],
        }),
        prisma.orgCommitteeMember.findMany({ orderBy: { urutan: "asc" } }),
      ]);

      const kepsekData = teachers.find((t) => t.isKepalaSekolah);
      const guruTendik = teachers.filter((t) => !t.isKepalaSekolah);

      return {
        kepalaSekolah: kepsekData
          ? { id: kepsekData.id, nama: kepsekData.nama, jabatan: kepsekData.jabatan, fotoUrl: kepsekData.fotoUrl }
          : null,
        komite: komite.map((k) => ({ id: k.id, nama: k.nama, jabatan: k.jabatan, fotoUrl: k.fotoUrl })),
        guru: guruTendik
          .filter((t) => classify(t.jabatan) === "guru")
          .map((t) => ({ id: t.id, nama: t.nama, jabatan: t.jabatan, fotoUrl: t.fotoUrl })),
        tendik: guruTendik
          .filter((t) => classify(t.jabatan) === "tendik")
          .map((t) => ({ id: t.id, nama: t.nama, jabatan: t.jabatan, fotoUrl: t.fotoUrl })),
      };
    } catch {
      return {
        kepalaSekolah: {
          id: "dummy-kepsek",
          nama: "[NAMA KEPALA SEKOLAH]",
          jabatan: "Kepala Sekolah",
          fotoUrl: null,
        },
        komite: [
          { id: "dummy-k1", nama: "[Nama Ketua Komite]", jabatan: "Ketua Komite Sekolah", fotoUrl: null },
        ],
        guru: [
          { id: "dummy-g1", nama: "Siti Aminah, S.Pd.", jabatan: "Guru Kelas 1A", fotoUrl: null },
          { id: "dummy-g2", nama: "Ahmad Yusuf, S.Pd.", jabatan: "Guru Kelas 2A", fotoUrl: null },
        ],
        tendik: [
          { id: "dummy-t1", nama: "Indah Permatasari", jabatan: "Operator Sekolah / Tata Usaha", fotoUrl: null },
        ],
      };
    }
  }
);
