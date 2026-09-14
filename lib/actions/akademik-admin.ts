"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage } from "@/lib/supabase/server";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Anda harus login untuk melakukan aksi ini.");
  return session.user;
}

async function logAction(userId: string, action: string, detail?: string) {
  try {
    await prisma.adminActionLog.create({ data: { userId, action, detail } });
  } catch {
    /* no-op */
  }
}

// ---------------------------------------------------------------
// ROMBONGAN BELAJAR (ClassRoom)
// ---------------------------------------------------------------
export type ClassRoomInput = {
  id?: string;
  nama: string;
  tingkat: number;
  tahunAjaran: string;
  waliKelasId?: string;
};

export async function upsertClassRoom(input: ClassRoomInput) {
  const user = await requireAdminSession();

  if (!input.nama.trim()) throw new Error("Nama rombel wajib diisi.");

  const data = {
    nama: input.nama,
    tingkat: input.tingkat,
    tahunAjaran: input.tahunAjaran,
    waliKelasId: input.waliKelasId || null,
  };

  if (input.id) {
    await prisma.classRoom.update({ where: { id: input.id }, data });
    await logAction(user.id, "UPDATE_CLASSROOM", input.id);
  } else {
    await prisma.classRoom.create({ data });
    await logAction(user.id, "CREATE_CLASSROOM", input.nama);
  }

  revalidatePath("/admin/akademik/rombel");
  revalidatePath("/akademik/rombongan-belajar");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteClassRoom(id: string) {
  const user = await requireAdminSession();
  await prisma.classRoom.delete({ where: { id } });
  await logAction(user.id, "DELETE_CLASSROOM", id);
  revalidatePath("/admin/akademik/rombel");
  revalidatePath("/akademik/rombongan-belajar");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// AGENDA (Kalender Akademik)
// ---------------------------------------------------------------
export type AgendaInput = {
  id?: string;
  judul: string;
  deskripsi?: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  kategori: string;
};

export async function upsertAgenda(input: AgendaInput) {
  const user = await requireAdminSession();

  if (!input.judul.trim()) throw new Error("Judul agenda wajib diisi.");

  const data = {
    judul: input.judul,
    deskripsi: input.deskripsi || null,
    tanggalMulai: new Date(input.tanggalMulai),
    tanggalSelesai: input.tanggalSelesai ? new Date(input.tanggalSelesai) : null,
    kategori: input.kategori,
  };

  if (input.id) {
    await prisma.agenda.update({ where: { id: input.id }, data });
    await logAction(user.id, "UPDATE_AGENDA", input.id);
  } else {
    await prisma.agenda.create({ data });
    await logAction(user.id, "CREATE_AGENDA", input.judul);
  }

  revalidatePath("/admin/akademik/kalender");
  revalidatePath("/akademik/kalender-akademik");
  return { success: true };
}

export async function deleteAgenda(id: string) {
  const user = await requireAdminSession();
  await prisma.agenda.delete({ where: { id } });
  await logAction(user.id, "DELETE_AGENDA", id);
  revalidatePath("/admin/akademik/kalender");
  revalidatePath("/akademik/kalender-akademik");
  return { success: true };
}

// ---------------------------------------------------------------
// EKSTRAKURIKULER (Extracurricular)
// ---------------------------------------------------------------
export async function upsertExtracurricular(formData: FormData) {
  const user = await requireAdminSession();

  const id = formData.get("id")?.toString() || undefined;
  const nama = formData.get("nama")?.toString() ?? "";
  const deskripsi = formData.get("deskripsi")?.toString() ?? "";
  const jadwal = formData.get("jadwal")?.toString() ?? "";
  const pembinaId = formData.get("pembinaId")?.toString() || null;
  const existingFotoUrl = formData.get("existingFotoUrl")?.toString() || null;
  const fotoFile = formData.get("foto");

  if (!nama.trim()) throw new Error("Nama ekstrakurikuler wajib diisi.");

  let fotoUrl = existingFotoUrl;
  if (fotoFile instanceof File && fotoFile.size > 0) {
    fotoUrl = await uploadPublicImage(fotoFile, "extracurricular");
  }

  const data = { nama, deskripsi: deskripsi || null, jadwal: jadwal || null, pembinaId, fotoUrl };

  if (id) {
    await prisma.extracurricular.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_EXTRACURRICULAR", id);
  } else {
    await prisma.extracurricular.create({ data });
    await logAction(user.id, "CREATE_EXTRACURRICULAR", nama);
  }

  revalidatePath("/admin/akademik/ekstrakurikuler");
  revalidatePath("/akademik/ekstrakurikuler");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteExtracurricular(id: string) {
  const user = await requireAdminSession();
  await prisma.extracurricular.delete({ where: { id } });
  await logAction(user.id, "DELETE_EXTRACURRICULAR", id);
  revalidatePath("/admin/akademik/ekstrakurikuler");
  revalidatePath("/akademik/ekstrakurikuler");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// KURIKULUM (School.kurikulumText)
// ---------------------------------------------------------------
export async function updateKurikulum(schoolId: string, kurikulumText: string) {
  const user = await requireAdminSession();

  await prisma.school.update({
    where: { id: schoolId },
    data: { kurikulumText },
  });

  await logAction(user.id, "UPDATE_KURIKULUM", schoolId);

  revalidatePath("/admin/akademik/kurikulum");
  revalidatePath("/akademik/kurikulum");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// JADWAL PELAJARAN (ScheduleSlot)
// ---------------------------------------------------------------
const HARI_INDEX: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
};

export type ScheduleSlotInput = {
  id?: string;
  tingkat: number;
  hari: string;
  jamKe: number;
  waktu: string;
  subjectId: string;
};

export async function upsertScheduleSlot(input: ScheduleSlotInput) {
  const user = await requireAdminSession();

  const hariIndex = HARI_INDEX[input.hari];
  if (!hariIndex) throw new Error("Hari tidak valid.");

  const data = {
    tingkat: input.tingkat,
    hari: input.hari,
    hariIndex,
    jamKe: input.jamKe,
    waktu: input.waktu,
    subjectId: input.subjectId,
  };

  if (input.id) {
    await prisma.scheduleSlot.update({ where: { id: input.id }, data });
    await logAction(user.id, "UPDATE_SCHEDULE_SLOT", input.id);
  } else {
    await prisma.scheduleSlot.upsert({
      where: {
        tingkat_hariIndex_jamKe: {
          tingkat: input.tingkat,
          hariIndex,
          jamKe: input.jamKe,
        },
      },
      create: data,
      update: data,
    });
    await logAction(user.id, "CREATE_SCHEDULE_SLOT", `${input.tingkat}-${input.hari}-${input.jamKe}`);
  }

  revalidatePath("/admin/akademik/jadwal");
  revalidatePath("/akademik/jadwal-pelajaran");
  return { success: true };
}

export async function deleteScheduleSlot(id: string) {
  const user = await requireAdminSession();
  await prisma.scheduleSlot.delete({ where: { id } });
  await logAction(user.id, "DELETE_SCHEDULE_SLOT", id);
  revalidatePath("/admin/akademik/jadwal");
  revalidatePath("/akademik/jadwal-pelajaran");
  return { success: true };
}
