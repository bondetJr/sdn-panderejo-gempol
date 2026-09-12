import { prisma } from "@/lib/prisma";

export async function getSchoolAdmin() {
  try {
    let school = await prisma.school.findFirst();
    if (!school) {
      school = await prisma.school.create({ data: {} }); // pakai semua default dari schema
    }
    return school;
  } catch {
    return null;
  }
}

export async function getKepalaSekolahAdmin() {
  try {
    return await prisma.teacher.findFirst({ where: { isKepalaSekolah: true } });
  } catch {
    return null;
  }
}

export async function getAllTeachersForKepsekSelect() {
  try {
    return await prisma.teacher.findMany({
      where: { isActive: true },
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, isKepalaSekolah: true },
    });
  } catch {
    return [];
  }
}

export async function getAllCommitteeMembersAdmin() {
  try {
    return await prisma.orgCommitteeMember.findMany({ orderBy: { urutan: "asc" } });
  } catch {
    return [];
  }
}

export async function getAllProgramsAdmin() {
  try {
    return await prisma.flagshipProgram.findMany({ orderBy: { urutan: "asc" } });
  } catch {
    return [];
  }
}

export async function getAllFacilitiesAdmin() {
  try {
    return await prisma.facility.findMany({ orderBy: { urutan: "asc" } });
  } catch {
    return [];
  }
}

export async function getAllAchievementsAdmin() {
  try {
    return await prisma.achievement.findMany({
      orderBy: [{ tahun: "desc" }],
    });
  } catch {
    return [];
  }
}
