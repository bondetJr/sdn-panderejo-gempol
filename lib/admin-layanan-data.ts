import { prisma } from "@/lib/prisma";

export async function getAllServiceStandardsAdmin() {
  try {
    return await prisma.serviceStandard.findMany({
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
    });
  } catch {
    return [];
  }
}
