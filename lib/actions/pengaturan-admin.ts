"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage } from "@/lib/supabase/image-upload";

/**
 * Proteksi khusus: hanya SUPER_ADMIN yang boleh mengelola akun User
 * (buat, ubah role, nonaktifkan, reset password, hapus). Ini
 * lapisan otorisasi kedua di server — selain UI yang juga
 * menyembunyikan menu ini dari role selain SUPER_ADMIN.
 */
import { logAction, requireRole, requireSuperAdmin, OPERATOR_PLUS } from "@/lib/guards";

// ---------------------------------------------------------------
// DATA SEKOLAH (School: kontak, logo)
// ---------------------------------------------------------------
export async function updateSchoolSettings(formData: FormData) {
  const user = await requireRole(OPERATOR_PLUS);

  const id = formData.get("id")?.toString();
  if (!id) throw new Error("ID sekolah tidak ditemukan.");

  const nama = formData.get("nama")?.toString() ?? "";
  const npsn = formData.get("npsn")?.toString() ?? "";
  const alamat = formData.get("alamat")?.toString() ?? "";
  const telepon = formData.get("telepon")?.toString() ?? "";
  const email = formData.get("email")?.toString() ?? "";
  const mapsEmbedUrl = formData.get("mapsEmbedUrl")?.toString() || null;
  const existingLogoUrl = formData.get("existingLogoUrl")?.toString() || null;
  const logoFile = formData.get("logo");

  if (!nama.trim() || !npsn.trim()) {
    throw new Error("Nama sekolah dan NPSN wajib diisi.");
  }

  let logoUrl = existingLogoUrl;
  if (logoFile instanceof File && logoFile.size > 0) {
    logoUrl = await uploadPublicImage(logoFile, "school-logo");
  }

  await prisma.school.update({
    where: { id },
    data: { nama, npsn, alamat, telepon, email, mapsEmbedUrl, logoUrl },
  });

  await logAction(user.id, "UPDATE_SCHOOL_SETTINGS", id);

  revalidatePath("/admin/pengaturan/sekolah");
  revalidatePath("/", "layout"); // header/footer publik pakai data sekolah
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// KELOLA USER — KHUSUS SUPER_ADMIN
// ---------------------------------------------------------------
export type UserInput = {
  id?: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "KEPALA_SEKOLAH" | "OPERATOR" | "GURU";
  isActive: boolean;
  password?: string; // hanya diisi saat buat baru atau reset password
};

export async function upsertUser(input: UserInput) {
  const admin = await requireSuperAdmin();

  if (!input.name.trim() || !input.email.trim()) {
    throw new Error("Nama dan email wajib diisi.");
  }

  if (input.id) {
    await prisma.user.update({
      where: { id: input.id },
      data: { name: input.name, role: input.role, isActive: input.isActive },
    });
    await logAction(admin.id, "UPDATE_USER", input.id);
  } else {
    if (!input.password || input.password.length < 8) {
      throw new Error("Password wajib diisi minimal 8 karakter untuk akun baru.");
    }
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new Error("Email ini sudah terdaftar.");

    const passwordHash = await bcrypt.hash(input.password, 12);
    await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        isActive: input.isActive,
      },
    });
    await logAction(admin.id, "CREATE_USER", input.email);
  }

  revalidatePath("/admin/pengaturan/users");
  return { success: true };
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const admin = await requireSuperAdmin();

  if (newPassword.length < 8) {
    throw new Error("Password baru minimal 8 karakter.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  await logAction(admin.id, "RESET_USER_PASSWORD", userId);
  revalidatePath("/admin/pengaturan/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const admin = await requireSuperAdmin();

  if (userId === admin.id) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
  }

  await prisma.user.delete({ where: { id: userId } });
  await logAction(admin.id, "DELETE_USER", userId);
  revalidatePath("/admin/pengaturan/users");
  return { success: true };
}
