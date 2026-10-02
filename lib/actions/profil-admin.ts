"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage } from "@/lib/supabase/image-upload";
import { logAction, requireRole, OPERATOR_PLUS } from "@/lib/guards";

// ---------------------------------------------------------------
// PROFIL UMUM SEKOLAH (School: visi, misi, sejarah, akreditasi)
// FIX: Support partial update - hanya update field yang dikirim
// ---------------------------------------------------------------
export async function updateSchoolProfile(formData: FormData) {
  const user = await requireRole(OPERATOR_PLUS);

  const id = formData.get("id")?.toString();
  if (!id) throw new Error("ID sekolah tidak ditemukan.");

  // Ambil existing data dulu untuk merge
  const existing = await prisma.school.findUnique({ where: { id } });
  if (!existing) throw new Error("Data sekolah tidak ditemukan.");

  // Hanya update field yang ada di FormData (partial update support)
  const data: Record<string, unknown> = {};

  if (formData.has("visi")) {
    data.visi = formData.get("visi")?.toString() ?? "";
  }
  if (formData.has("misi")) {
    data.misi = formData.get("misi")?.toString() ?? "";
  }
  if (formData.has("sejarah")) {
    data.sejarah = formData.get("sejarah")?.toString() ?? "";
  }
  if (formData.has("akreditasi")) {
    const akreditasi = formData.get("akreditasi")?.toString() ?? "";
    data.akreditasi = akreditasi || null;
  }
  if (formData.has("akreditasiTahun")) {
    const akreditasiTahun = formData.get("akreditasiTahun")?.toString();
    data.akreditasiTahun = akreditasiTahun ? Number(akreditasiTahun) : null;
  }

  await prisma.school.update({
    where: { id },
    data,
  });

  await logAction(user.id, "UPDATE_SCHOOL_PROFILE", id);

  revalidatePath("/admin/profil/umum");
  revalidatePath("/admin/profil/prestasi");
  revalidatePath("/profil/visi-misi");
  revalidatePath("/profil/sejarah");
  revalidatePath("/profil/struktur-organisasi");
  revalidatePath("/profil/akreditasi-prestasi");
  revalidatePath("/kenali-sekolah");
  revalidatePath("/");
  return { success: true };
}

// ---------------------------------------------------------------
// SAMBUTAN KEPALA SEKOLAH
// ---------------------------------------------------------------
export async function updateSambutanKepsek(teacherId: string, sambutanText: string) {
  const user = await requireRole(OPERATOR_PLUS);
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
// PROGRAM UNGGULAN
// ---------------------------------------------------------------
export async function upsertProgram(formData: FormData) {
  const user = await requireRole(OPERATOR_PLUS);
  const id = formData.get("id")?.toString() || undefined;
  const nama = formData.get("nama")?.toString() ?? "";
  const deskripsiSingkat = formData.get("deskripsiSingkat")?.toString() ?? "";
  const deskripsiLengkap = formData.get("deskripsiLengkap")?.toString() ?? "";
  const realisasiText = formData.get("realisasiText")?.toString() || null;
  const impactUtama = formData.get("impactUtama")?.toString() || null;
  const impactSatu = formData.get("impactSatu")?.toString() || null;
  const impactDua = formData.get("impactDua")?.toString() || null;
  const impactTiga = formData.get("impactTiga")?.toString() || null;
  const icon = formData.get("icon")?.toString() ?? "Sparkles";
  const urutan = Number(formData.get("urutan") ?? 0);
  const isPublished = formData.get("isPublished") === "true";
  const existingFotoUrl = formData.get("existingFotoUrl")?.toString() || null;
  const fotoFile = formData.get("foto");
  const subImageFiles = formData.getAll("subImages").filter((file): file is File => file instanceof File && file.size > 0);
  const deletedSubImageIds = formData.getAll("deletedSubImageIds").map(String);

  if (!nama.trim() || !deskripsiSingkat.trim()) throw new Error("Nama dan deskripsi singkat wajib diisi.");

  let fotoUrl = existingFotoUrl;
  if (fotoFile instanceof File && fotoFile.size > 0) {
    fotoUrl = await uploadPublicImage(fotoFile, "flagship-program");
  }

  const data = { nama, deskripsiSingkat, deskripsiLengkap: deskripsiLengkap || deskripsiSingkat, realisasiText, impactUtama, impactSatu, impactDua, impactTiga, icon, urutan, isPublished, fotoUrl };
  const program = id ? await prisma.flagshipProgram.update({ where: { id }, data }) : await prisma.flagshipProgram.create({ data });

  if (deletedSubImageIds.length > 0) {
    await prisma.flagshipProgramImage.deleteMany({ where: { id: { in: deletedSubImageIds }, programId: program.id } });
  }
  if (subImageFiles.length > 0) {
    const existingCount = await prisma.flagshipProgramImage.count({ where: { programId: program.id } });
    const urls = await Promise.all(subImageFiles.map((file) => uploadPublicImage(file, `flagship-program/${program.id}`)));
    await prisma.flagshipProgramImage.createMany({ data: urls.map((url, index) => ({ programId: program.id, url, urutan: existingCount + index })) });
  }

  await logAction(user.id, id ? "UPDATE_PROGRAM" : "CREATE_PROGRAM", id ?? nama);
  revalidatePath("/admin/profil/program");
  revalidatePath("/admin/akademik/program-unggulan");
  revalidatePath("/");
  revalidatePath("/kenali-sekolah");
  revalidatePath("/akademik/program-unggulan");
  return { success: true };
}

export async function deleteProgram(id: string) {
  const user = await requireRole(OPERATOR_PLUS);
  await prisma.flagshipProgram.delete({ where: { id } });
  await logAction(user.id, "DELETE_PROGRAM", id);
  revalidatePath("/admin/profil/program");
  revalidatePath("/admin/akademik/program-unggulan");
  revalidatePath("/");
  revalidatePath("/kenali-sekolah");
  revalidatePath("/akademik/program-unggulan");
  return { success: true };
}

// ---------------------------------------------------------------
// KOMITE SEKOLAH
// ---------------------------------------------------------------
export async function upsertCommitteeMember(formData: FormData) {
  const user = await requireRole(OPERATOR_PLUS);
  const id = formData.get("id")?.toString() || undefined;
  const nama = formData.get("nama")?.toString() ?? "";
  const jabatan = formData.get("jabatan")?.toString() ?? "";
  const urutan = Number(formData.get("urutan") ?? 0);
  const existingFotoUrl = formData.get("existingFotoUrl")?.toString() || null;
  const fotoFile = formData.get("foto");
  if (!nama.trim() || !jabatan.trim()) throw new Error("Nama dan jabatan wajib diisi.");
  let fotoUrl = existingFotoUrl;
  if (fotoFile instanceof File && fotoFile.size > 0) fotoUrl = await uploadPublicImage(fotoFile, "komite-sekolah");
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
  const user = await requireRole(OPERATOR_PLUS);
  await prisma.orgCommitteeMember.delete({ where: { id } });
  await logAction(user.id, "DELETE_KOMITE", id);
  revalidatePath("/admin/profil/struktur");
  revalidatePath("/profil/struktur-organisasi");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// FASILITAS
// ---------------------------------------------------------------
export async function upsertFacility(formData: FormData) {
  const user = await requireRole(OPERATOR_PLUS);
  const id = formData.get("id")?.toString() || undefined;
  const nama = formData.get("nama")?.toString() ?? "";
  const deskripsi = formData.get("deskripsi")?.toString() ?? "";
  const icon = formData.get("icon")?.toString() ?? "";
  const urutan = Number(formData.get("urutan") ?? 0);
  const isPublished = formData.get("isPublished") === "true";
  const existingGambarUrl = formData.get("existingGambarUrl")?.toString();
  const imageFile = formData.get("gambar");
  if (!nama.trim() || !deskripsi.trim()) throw new Error("Nama dan deskripsi fasilitas wajib diisi.");
  let gambarUrl = existingGambarUrl ?? "";
  if (imageFile instanceof File && imageFile.size > 0) gambarUrl = await uploadPublicImage(imageFile, "facility");
  if (!gambarUrl) throw new Error("Gambar fasilitas wajib diunggah.");
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
  const user = await requireRole(OPERATOR_PLUS);
  await prisma.facility.delete({ where: { id } });
  await logAction(user.id, "DELETE_FACILITY", id);
  revalidatePath("/admin/profil/fasilitas");
  revalidatePath("/profil/fasilitas");
  revalidatePath("/");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

// ---------------------------------------------------------------
// PRESTASI
// ---------------------------------------------------------------
export async function upsertAchievement(formData: FormData) {
  const user = await requireRole(OPERATOR_PLUS);
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
  if (fotoFile instanceof File && fotoFile.size > 0) fotoUrl = await uploadPublicImage(fotoFile, "achievement");
  const data = { judul, tingkat: tingkat as "SEKOLAH" | "KECAMATAN" | "KABUPATEN" | "PROVINSI" | "NASIONAL", tahun, deskripsi, atasNamaSiswa, fotoUrl };
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
  const user = await requireRole(OPERATOR_PLUS);
  await prisma.achievement.delete({ where: { id } });
  await logAction(user.id, "DELETE_ACHIEVEMENT", id);
  revalidatePath("/admin/profil/prestasi");
  revalidatePath("/profil/akreditasi-prestasi");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}
