"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage } from "@/lib/supabase/image-upload";

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
// CRUD GURU / TENDIK (Teacher)
// ---------------------------------------------------------------
export async function upsertTeacher(formData: FormData) {
  const user = await requireAdminSession();

  const id = formData.get("id")?.toString() || undefined;
  const nama = formData.get("nama")?.toString() ?? "";
  const nip = formData.get("nip")?.toString() || null;
  const nuptk = formData.get("nuptk")?.toString() || null;
  const jabatan = formData.get("jabatan")?.toString() ?? "";
  const statusKepegawaian = formData.get("statusKepegawaian")?.toString() ?? "HONORER";
  const jenisKelamin = formData.get("jenisKelamin")?.toString() || null;
  const mapelDiampu = formData.get("mapelDiampu")?.toString() || null;
  const isActive = formData.get("isActive") === "true";
  const urutan = Number(formData.get("urutan") ?? 0);
  const existingFotoUrl = formData.get("existingFotoUrl")?.toString() || null;
  const fotoFile = formData.get("foto");

  if (!nama.trim() || !jabatan.trim()) {
    throw new Error("Nama dan jabatan wajib diisi.");
  }

  let fotoUrl = existingFotoUrl;
  if (fotoFile instanceof File && fotoFile.size > 0) {
    fotoUrl = await uploadPublicImage(fotoFile, "teacher");
  }

  const data = {
    nama,
    nip,
    nuptk,
    jabatan,
    statusKepegawaian: statusKepegawaian as "PNS" | "PPPK" | "HONORER",
    jenisKelamin: jenisKelamin as "L" | "P" | null,
    mapelDiampu,
    isActive,
    urutan,
    fotoUrl,
  };

  if (id) {
    await prisma.teacher.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_TEACHER", id);
  } else {
    await prisma.teacher.create({ data });
    await logAction(user.id, "CREATE_TEACHER", nama);
  }

  revalidatePath("/admin/guru");
  revalidatePath("/guru-dan-tendik");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteTeacher(id: string) {
  const user = await requireAdminSession();
  await prisma.teacher.delete({ where: { id } });
  await logAction(user.id, "DELETE_TEACHER", id);
  revalidatePath("/admin/guru");
  revalidatePath("/guru-dan-tendik");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// BUAT AKUN LOGIN UNTUK GURU (link ke User)
// ---------------------------------------------------------------
export async function createLoginForTeacher(
  teacherId: string,
  email: string,
  password: string
) {
  const admin = await requireAdminSession();

  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email ini sudah terdaftar sebagai akun lain.");

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new Error("Data guru tidak ditemukan.");

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: teacher.nama,
      email,
      passwordHash,
      role: teacher.isKepalaSekolah ? "KEPALA_SEKOLAH" : "GURU",
      teacherId: teacher.id,
    },
  });

  await logAction(admin.id, "CREATE_USER_FOR_TEACHER", `${teacherId} -> ${email}`);

  revalidatePath("/admin/guru");
  return { success: true };
}
