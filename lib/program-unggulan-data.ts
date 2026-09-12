import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { PROGRAM_UNGGULAN } from "@/lib/program-unggulan";

export type FlagshipProgramItem = {
  id: string;
  nama: string;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  fotoUrl: string | null;
  icon: string;
};

export const getFlagshipPrograms = cache(
  async (): Promise<FlagshipProgramItem[]> => {
    try {
      const data = await prisma.flagshipProgram.findMany({
        where: { isPublished: true },
        orderBy: { urutan: "asc" },
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
        icon: p.icon,
      }));
    }
  }
);
