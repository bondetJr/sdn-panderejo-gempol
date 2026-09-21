"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAction, requireRole, OPERATOR_PLUS } from "@/lib/guards";
import { encryptPii, hashPiiForLookup } from "@/lib/crypto/pii";

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
  const user = await requireRole(OPERATOR_PLUS);
  validateFormat(input);

  // Cek duplikasi NISN/NIK (kolom unique di database) supaya pesan error jelas,
  // bukan error mentah dari Prisma.
  if (input.nisn) {
    const existing = await prisma.student.findFirst({
      where: { nisn: input.nisn, ...(input.id ? { NOT: { id: input.id } } : {}) },
    });
    if (existing) throw new Error("NISN ini sudah dipakai siswa lain.");
  }
  // Cek duplikasi NIK lewat hash — TIDAK PERNAH query NIK plaintext.
  const nikHash = input.nik ? hashPiiForLookup(input.nik) : null;
  if (nikHash) {
    const existing = await prisma.student.findFirst({
      where: { nikHash, ...(input.id ? { NOT: { id: input.id } } : {}) },
    });
    if (existing) throw new Error("NIK ini sudah dipakai siswa lain.");
  }

  const data = {
    classRoomId: input.classRoomId,
    nama: input.nama,
    nis: input.nis || null,
    nisn: input.nisn || null,
    nikEncrypted: input.nik ? encryptPii(input.nik) : null,
    nikHash,
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
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteStudent(id: string, classRoomId: string) {
  const user = await requireRole(OPERATOR_PLUS);
  await prisma.student.delete({ where: { id } });
  await logAction(user.id, "DELETE_STUDENT", id);
  revalidatePath(`/admin/akademik/rombel/${classRoomId}`);
  revalidatePath("/akademik/rombongan-belajar");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}
