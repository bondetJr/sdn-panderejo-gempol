import { prisma } from "@/lib/prisma";

export async function getAllClassRoomsAdmin() {
  try {
    return await prisma.classRoom.findMany({
      orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
      include: { waliKelas: true, _count: { select: { students: true } } },
    });
  } catch {
    return [];
  }
}

export async function getAllAgendaAdmin() {
  try {
    return await prisma.agenda.findMany({ orderBy: { tanggalMulai: "desc" } });
  } catch {
    return [];
  }
}

export async function getAllExtracurricularsAdmin() {
  try {
    return await prisma.extracurricular.findMany({
      include: { pembina: true },
      orderBy: { nama: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getTeachersForSelectAdmin() {
  try {
    return await prisma.teacher.findMany({
      where: { isActive: true },
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------
// KURIKULUM (School.kurikulumText)
// ---------------------------------------------------------------
export async function getKurikulumAdmin() {
  try {
    let school = await prisma.school.findFirst();
    if (!school) school = await prisma.school.create({ data: {} });
    return school;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------
// JADWAL PELAJARAN (ScheduleSlot)
// ---------------------------------------------------------------
export async function getScheduleSlotsAdmin(tingkat: number) {
  try {
    return await prisma.scheduleSlot.findMany({
      where: { tingkat },
      orderBy: [{ hariIndex: "asc" }, { jamKe: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getAllScheduleSlotsAdmin() {
  try {
    return await prisma.scheduleSlot.findMany({
      orderBy: [{ tingkat: "asc" }, { hariIndex: "asc" }, { jamKe: "asc" }],
    });
  } catch {
    return [];
  }
}
