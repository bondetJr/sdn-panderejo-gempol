import { prisma } from "@/lib/prisma";

export async function getAllTeachersAdmin() {
  try {
    return await prisma.teacher.findMany({
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
      include: { user: { select: { id: true, email: true, isActive: true } } },
    });
  } catch {
    return [];
  }
}
