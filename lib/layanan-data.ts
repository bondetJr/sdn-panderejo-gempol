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
  urutan?: number;
  isPublished?: boolean;
};

/**
 * Data untuk halaman publik /layanan -- HANYA yang isPublished: true.
 * Tidak ada fallback data dummy: kalau database kosong/error, kembalikan
 * array kosong dan biarkan UI menampilkan pesan "belum tersedia" yang jujur,
 * daripada diam-diam menampilkan data contoh sebagai info resmi sekolah.
 */
export const getServiceStandards = cache(async (): Promise<ServiceStandardItem[]> => {
  try {
    const data = await prisma.serviceStandard.findMany({
      where: { isPublished: true },
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
    });
    return data as unknown as ServiceStandardItem[];
  } catch (e) {
    console.error("[layanan-data] getServiceStandards gagal:", e);
    return [];
  }
});
