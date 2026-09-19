import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type ServiceStandardItem = {
  id: string;
  nama: string;
  coverImage: string | null;
  deskripsi: string;
  persyaratan: string;
  mekanismeImage: string | null;
  mekanismeText: string | null;
  waktuPelayanan: string | null;
  biaya: string | null;
  produkLayanan: string | null;
  pengaduan: string | null;
  documentFile: string | null;
  documentName: string | null;
};

export const getServiceStandards = cache(
  async (): Promise<ServiceStandardItem[]> => {
    try {
      return await prisma.serviceStandard.findMany({
        where: { isPublished: true },
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
        select: {
          id: true,
          nama: true,
          coverImage: true,
          deskripsi: true,
          persyaratan: true,
          mekanismeImage: true,
          mekanismeText: true,
          waktuPelayanan: true,
          biaya: true,
          produkLayanan: true,
          pengaduan: true,
          documentFile: true,
          documentName: true,
        },
      });
    } catch {
      return [];
    }
  }
);
