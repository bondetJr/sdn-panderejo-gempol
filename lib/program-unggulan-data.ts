import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { PROGRAM_UNGGULAN } from "@/lib/program-unggulan";

export type FlagshipProgramItem = {
  id: string;
  nama: string;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  fotoUrl: string | null;
  realisasiText: string | null;
  impactUtama: string | null;
  impactSatu: string | null;
  impactDua: string | null;
  impactTiga: string | null;
  subImages: { id: string; url: string; urutan: number }[];
  icon: string;
};

export const getFlagshipPrograms = cache(
  async (): Promise<FlagshipProgramItem[]> => {
    try {
      const data = await prisma.flagshipProgram.findMany({
        where: { isPublished: true },
        orderBy: { urutan: "asc" },
        include: { subImages: { orderBy: { urutan: "asc" } } },
      });
      if (data.length === 0) throw new Error("empty");
      return data;
    } catch {
      // Fallback ke 6 program contoh (belum diisi lewat admin)
      return PROGRAM_UNGGULAN.map((p) => ({
        id: p.id,
        nama: p.nama,
        deskripsiSingkat: p.deskripsi,
        deskripsiLengkap: p.deskripsi,
        fotoUrl: null,
        realisasiText: null,
        impactUtama: null,
        impactSatu: null,
        impactDua: null,
        impactTiga: null,
        subImages: [],
        icon: p.icon,
      }));
    }
  }
);
