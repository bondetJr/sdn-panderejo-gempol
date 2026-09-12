import { prisma } from "@/lib/prisma";

export async function getSchoolSettingsAdmin() {
  try {
    let school = await prisma.school.findFirst();
    if (!school) school = await prisma.school.create({ data: {} });
    return school;
  } catch {
    return null;
  }
}

export async function getAllUsersAdmin() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      include: { teacher: { select: { id: true, nama: true } } },
    });
  } catch {
    return [];
  }
}
