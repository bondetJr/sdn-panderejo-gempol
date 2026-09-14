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
// PROFIL UMUM SEKOLAH (School: visi, misi, sejarah, struktur, akreditasi)
// ---------------------------------------------------------------
export async function updateSchoolProfile(formData: FormData) {
  const user = await requireAdminSession();

  const id = formData.get("id")?.toString();
  if (!id) throw new Error("ID sekolah tidak ditemukan.");

  const visi = formData.get("visi")?.toString() ?? "";
  const misi = formData.get("misi")?.toString() ?? "";
  const sejarah = formData.get("sejarah")?.toString() ?? "";
  const akreditasi = formData.get("akreditasi")?.toString() ?? "";
  const akreditasiTahun = formData.get("akreditasiTahun")?.toString();

  await prisma.school.update({
    where: { id },
    data: {
      visi,
      misi,
      sejarah,
      akreditasi: akreditasi || null,
      akreditasiTahun: akreditasiTahun ? Number(akreditasiTahun) : null,
    },
  });

  await logAction(user.id, "UPDATE_SCHOOL_PROFILE", id);

  revalidatePath("/admin/profil/umum");
  revalidatePath("/profil/visi-misi");
  revalidatePath("/profil/sejarah");
  revalidatePath("/profil/struktur-organisasi");
  revalidatePath("/profil/akreditasi-prestasi");
  revalidatePath("/kenali-sekolah");
  revalidatePath("/");
  return { success: true };
}

// ---------------------------------------------------------------
// SAMBUTAN KEPALA SEKOLAH (field di model Teacher)
// ---------------------------------------------------------------
export async function updateSambutanKepsek(teacherId: string, sambutanText: string) {
  const user = await requireAdminSession();

  // Pastikan hanya 1 guru berstatus Kepala Sekolah aktif
  await prisma.teacher.updateMany({
    where: { isKepalaSekolah: true, NOT: { id: teacherId } },
    data: { isKepalaSekolah: false },
  });

  await prisma.teacher.update({
    where: { id: teacherId },
    data: { isKepalaSekolah: true, sambutanText },
  });

  await logAction(user.id, "UPDATE_SAMBUTAN_KEPSEK", teacherId);

  revalidatePath("/admin/profil/sambutan");
  revalidatePath("/profil/sambutan-kepala-sekolah");
  revalidatePath("/");
  return { success: true };
}

// ---------------------------------------------------------------
// PROGRAM UNGGULAN (FlagshipProgram)
// ---------------------------------------------------------------
export async function upsertProgram(formData: FormData) {
  const user = await requireAdminSession();

  const id = formData.get("id")?.toString() || undefined;
  const nama = formData.get("nama")?.toString() ?? "";
  const deskripsiSingkat = formData.get("deskripsiSingkat")?.toString() ?? "";
  const deskripsiLengkap = formData.get("deskripsiLengkap")?.toString() ?? "";
  const icon = formData.get("icon")?.toString() ?? "Sparkles";
  const urutan = Number(formData.get("urutan") ?? 0);
  const isPublished = formData.get("isPublished") === "true";
  const existingFotoUrl = formData.get("existingFotoUrl")?.toString() || null;
  const fotoFile = formData.get("foto");

  if (!nama.trim() || !deskripsiSingkat.trim()) {
    throw new Error("Nama dan deskripsi singkat wajib diisi.");
  }

  let fotoUrl = existingFotoUrl;
  if (fotoFile instanceof File && fotoFile.size > 0) {
    fotoUrl = await uploadPublicImage(fotoFile, "flagship-program");
  }

  const data = {
    nama,
    deskripsiSingkat,
    deskripsiLengkap: deskripsiLengkap || deskripsiSingkat,
    icon,
    urutan,
    isPublished,
    fotoUrl,
  };

  if (id) {
    await prisma.flagshipProgram.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_PROGRAM", id);
  } else {
    await prisma.flagshipProgram.create({ data });
    await logAction(user.id, "CREATE_PROGRAM", nama);
  }

  revalidatePath("/admin/profil/program");
  revalidatePath("/");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteProgram(id: string) {
  const user = await requireAdminSession();
  await prisma.flagshipProgram.delete({ where: { id } });
  await logAction(user.id, "DELETE_PROGRAM", id);
  revalidatePath("/admin/profil/program");
  revalidatePath("/");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// STRUKTUR ORGANISASI — KOMITE SEKOLAH (OrgCommitteeMember)
// ---------------------------------------------------------------
export async function upsertCommitteeMember(formData: FormData) {
  const user = await requireAdminSession();

  const id = formData.get("id")?.toString() || undefined;
  const nama = formData.get("nama")?.toString() ?? "";
  const jabatan = formData.get("jabatan")?.toString() ?? "";
  const urutan = Number(formData.get("urutan") ?? 0);
  const existingFotoUrl = formData.get("existingFotoUrl")?.toString() || null;
  const fotoFile = formData.get("foto");

  if (!nama.trim() || !jabatan.trim()) {
    throw new Error("Nama dan jabatan wajib diisi.");
  }

  let fotoUrl = existingFotoUrl;
  if (fotoFile instanceof File && fotoFile.size > 0) {
    fotoUrl = await uploadPublicImage(fotoFile, "komite-sekolah");
  }

  const data = { nama, jabatan, urutan, fotoUrl };

  if (id) {
    await prisma.orgCommitteeMember.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_KOMITE", id);
  } else {
    await prisma.orgCommitteeMember.create({ data });
    await logAction(user.id, "CREATE_KOMITE", nama);
  }

  revalidatePath("/admin/profil/struktur");
  revalidatePath("/profil/struktur-organisasi");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteCommitteeMember(id: string) {
  const user = await requireAdminSession();
  await prisma.orgCommitteeMember.delete({ where: { id } });
  await logAction(user.id, "DELETE_KOMITE", id);
  revalidatePath("/admin/profil/struktur");
  revalidatePath("/profil/struktur-organisasi");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// FASILITAS (Facility)
// ---------------------------------------------------------------
export async function upsertFacility(formData: FormData) {
  const user = await requireAdminSession();

  const id = formData.get("id")?.toString() || undefined;
  const nama = formData.get("nama")?.toString() ?? "";
  const deskripsi = formData.get("deskripsi")?.toString() ?? "";
  const icon = formData.get("icon")?.toString() ?? "";
  const urutan = Number(formData.get("urutan") ?? 0);
  const isPublished = formData.get("isPublished") === "true";
  const existingGambarUrl = formData.get("existingGambarUrl")?.toString();
  const imageFile = formData.get("gambar");

  if (!nama.trim() || !deskripsi.trim()) {
    throw new Error("Nama dan deskripsi fasilitas wajib diisi.");
  }

  let gambarUrl = existingGambarUrl ?? "";
  if (imageFile instanceof File && imageFile.size > 0) {
    gambarUrl = await uploadPublicImage(imageFile, "facility");
  }
  if (!gambarUrl) {
    throw new Error("Gambar fasilitas wajib diunggah.");
  }

  const data = { nama, deskripsi, icon: icon || null, urutan, isPublished, gambarUrl };

  if (id) {
    await prisma.facility.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_FACILITY", id);
  } else {
    await prisma.facility.create({ data });
    await logAction(user.id, "CREATE_FACILITY", nama);
  }

  revalidatePath("/admin/profil/fasilitas");
  revalidatePath("/profil/fasilitas");
  revalidatePath("/");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteFacility(id: string) {
  const user = await requireAdminSession();
  await prisma.facility.delete({ where: { id } });
  await logAction(user.id, "DELETE_FACILITY", id);
  revalidatePath("/admin/profil/fasilitas");
  revalidatePath("/profil/fasilitas");
  revalidatePath("/");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// PRESTASI (Achievement)
// ---------------------------------------------------------------
export async function upsertAchievement(formData: FormData) {
  const user = await requireAdminSession();

  const id = formData.get("id")?.toString() || undefined;
  const judul = formData.get("judul")?.toString() ?? "";
  const tingkat = formData.get("tingkat")?.toString() ?? "SEKOLAH";
  const tahun = Number(formData.get("tahun") ?? new Date().getFullYear());
  const deskripsi = formData.get("deskripsi")?.toString() || null;
  const atasNamaSiswa = formData.get("atasNamaSiswa")?.toString() || null;
  const existingFotoUrl = formData.get("existingFotoUrl")?.toString() || null;
  const fotoFile = formData.get("foto");

  if (!judul.trim()) throw new Error("Judul prestasi wajib diisi.");

  let fotoUrl = existingFotoUrl;
  if (fotoFile instanceof File && fotoFile.size > 0) {
    fotoUrl = await uploadPublicImage(fotoFile, "achievement");
  }

  const data = {
    judul,
    tingkat: tingkat as "SEKOLAH" | "KECAMATAN" | "KABUPATEN" | "PROVINSI" | "NASIONAL",
    tahun,
    deskripsi,
    atasNamaSiswa,
    fotoUrl,
  };

  if (id) {
    await prisma.achievement.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_ACHIEVEMENT", id);
  } else {
    await prisma.achievement.create({ data });
    await logAction(user.id, "CREATE_ACHIEVEMENT", judul);
  }

  revalidatePath("/admin/profil/prestasi");
  revalidatePath("/profil/akreditasi-prestasi");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteAchievement(id: string) {
  const user = await requireAdminSession();
  await prisma.achievement.delete({ where: { id } });
  await logAction(user.id, "DELETE_ACHIEVEMENT", id);
  revalidatePath("/admin/profil/prestasi");
  revalidatePath("/profil/akreditasi-prestasi");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}
