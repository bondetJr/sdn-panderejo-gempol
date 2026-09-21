import { prisma } from "@/lib/prisma";
import { safeDecryptPii } from "@/lib/crypto/pii";

export async function getClassRoomWithStudentsAdmin(classRoomId: string) {
  try {
    const classRoom = await prisma.classRoom.findUnique({
      where: { id: classRoomId },
      include: {
        waliKelas: { select: { id: true, nama: true } },
        students: { orderBy: { nama: "asc" } },
      },
    });
    if (!classRoom) return null;

    return {
      ...classRoom,
      students: classRoom.students.map((s) => ({
        ...s,
        nik: s.nikEncrypted ? safeDecryptPii(s.nikEncrypted) : s.nik,
      })),
    };
  } catch {
    return null;
  }
}
