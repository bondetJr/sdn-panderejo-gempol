"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

export type StudentInput = {
  id?: string;
  classRoomId: string;
  nama: string;
  nis?: string;
  nisn?: string;
  nik?: string;
  jenisKelamin: "L" | "P";
  isActive: boolean;
};

function validateFormat(input: StudentInput) {
  if (!input.nama.trim()) throw new Error("Nama siswa wajib diisi.");
  if (input.nisn && !/^\d{10}$/.test(input.nisn)) {
    throw new Error("NISN harus 10 digit angka.");
  }
  if (input.nik && !/^\d{16}$/.test(input.nik)) {
    throw new Error("NIK harus 16 digit angka.");
  }
}

export async function upsertStudent(input: StudentInput) {
  const user = await requireAdminSession();
  validateFormat(input);

  // Cek duplikasi NISN/NIK (kolom unique di database) supaya pesan error jelas,
  // bukan error mentah dari Prisma.
  if (input.nisn) {
    const existing = await prisma.student.findFirst({
      where: { nisn: input.nisn, ...(input.id ? { NOT: { id: input.id } } : {}) },
    });
    if (existing) throw new Error("NISN ini sudah dipakai siswa lain.");
  }
  if (input.nik) {
    const existing = await prisma.student.findFirst({
      where: { nik: input.nik, ...(input.id ? { NOT: { id: input.id } } : {}) },
    });
    if (existing) throw new Error("NIK ini sudah dipakai siswa lain.");
  }

  const data = {
    classRoomId: input.classRoomId,
    nama: input.nama,
    nis: input.nis || null,
    nisn: input.nisn || null,
    nik: input.nik || null,
    jenisKelamin: input.jenisKelamin,
    isActive: input.isActive,
  };

  if (input.id) {
    await prisma.student.update({ where: { id: input.id }, data });
    await logAction(user.id, "UPDATE_STUDENT", input.id);
  } else {
    await prisma.student.create({ data });
    await logAction(user.id, "CREATE_STUDENT", input.nama);
  }

  revalidatePath(`/admin/akademik/rombel/${input.classRoomId}`);
  revalidatePath("/akademik/rombongan-belajar");
  return { success: true };
}

export async function deleteStudent(id: string, classRoomId: string) {
  const user = await requireAdminSession();
  await prisma.student.delete({ where: { id } });
  await logAction(user.id, "DELETE_STUDENT", id);
  revalidatePath(`/admin/akademik/rombel/${classRoomId}`);
  revalidatePath("/akademik/rombongan-belajar");
  return { success: true };
}
