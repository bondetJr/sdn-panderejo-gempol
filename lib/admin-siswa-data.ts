import { prisma } from "@/lib/prisma";

export async function getClassRoomWithStudentsAdmin(classRoomId: string) {
  try {
    return await prisma.classRoom.findUnique({
      where: { id: classRoomId },
      include: {
        waliKelas: { select: { id: true, nama: true } },
        students: { orderBy: { nama: "asc" } },
      },
    });
  } catch {
    return null;
  }
}
