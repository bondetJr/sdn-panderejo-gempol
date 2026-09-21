"use server";

import { revalidatePath } from "next/cache";
<<<<<<< HEAD
import { prisma } from "@/lib/prisma";
import { logAction, OPERATOR_PLUS, requireRole } from "@/lib/guards";
import { uploadPublicFile, uploadPublicImage } from "@/lib/supabase/image-upload";

export async function upsertServiceStandard(formData: FormData) {
  const user = await requireRole(OPERATOR_PLUS);

  const id = formData.get("id")?.toString() || undefined;
  const judul = formData.get("judul")?.toString() ?? "";
  const deskripsi = formData.get("deskripsi")?.toString() ?? "";
  const persyaratan = formData.get("persyaratan")?.toString() ?? "";
  const mekanismeText = formData.get("mekanismeText")?.toString() ?? "";
  const waktuPelayanan = formData.get("waktuPelayanan")?.toString() || null;
  const biaya = formData.get("biaya")?.toString() || null;
  const produkLayanan = formData.get("produkLayanan")?.toString() ?? "";
  const pengaduan = formData.get("pengaduan")?.toString() ?? "";
  const urutan = Number(formData.get("urutan") ?? 0);
  const isPublished = formData.get("isPublished") === "true";

  const existingCoverImage = formData.get("existingCoverImage")?.toString() || null;
  const existingMekanismeImage = formData.get("existingMekanismeImage")?.toString() || null;
  const existingDocumentFile = formData.get("existingDocumentFile")?.toString() || null;

  const coverFile = formData.get("coverImage");
  const mekanismeFile = formData.get("mekanismeImage");
  const documentFile = formData.get("documentFile");

  if (!judul.trim() || !deskripsi.trim() || !persyaratan.trim() || !mekanismeText.trim() || !produkLayanan.trim() || !pengaduan.trim()) {
    throw new Error("Semua field utama layanan wajib diisi.");
  }

  let coverImage = existingCoverImage;
=======
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage } from "@/lib/supabase/image-upload";
import { uploadPublicDocument } from "@/lib/supabase/file-upload";

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

function revalidateLayanan() {
  revalidatePath("/admin/layanan");
  revalidatePath("/layanan");
}

export async function upsertServiceStandard(formData: FormData) {
  const user = await requireAdminSession();

  const id = formData.get("id")?.toString() || undefined;
  const nama = formData.get("nama")?.toString().trim() ?? "";
  const deskripsi = formData.get("deskripsi")?.toString().trim() ?? "";
  const persyaratan = formData.get("persyaratan")?.toString().trim() ?? "";
  const mekanismeText = formData.get("mekanismeText")?.toString().trim() ?? "";
  const waktuPelayanan = formData.get("waktuPelayanan")?.toString().trim() ?? "";
  const biaya = formData.get("biaya")?.toString().trim() ?? "";
  const produkLayanan = formData.get("produkLayanan")?.toString().trim() ?? "";
  const pengaduan = formData.get("pengaduan")?.toString().trim() ?? "";
  const urutan = Number(formData.get("urutan")?.toString() ?? "0");
  const isPublished = formData.get("isPublished")?.toString() !== "false";

  if (!nama) throw new Error("Nama layanan wajib diisi.");
  if (!deskripsi) throw new Error("Deskripsi layanan wajib diisi.");
  if (!persyaratan) throw new Error("Persyaratan layanan wajib diisi.");

  let coverImage = formData.get("existingCoverImage")?.toString() || null;
  const coverFile = formData.get("coverImage");
>>>>>>> b42813ae25ac0ef20e7d1d6c29bcd55c1e4aec89
  if (coverFile instanceof File && coverFile.size > 0) {
    coverImage = await uploadPublicImage(coverFile, "layanan/cover");
  }

<<<<<<< HEAD
  let mekanismeImage = existingMekanismeImage;
=======
  let mekanismeImage = formData.get("existingMekanismeImage")?.toString() || null;
  const mekanismeFile = formData.get("mekanismeImage");
>>>>>>> b42813ae25ac0ef20e7d1d6c29bcd55c1e4aec89
  if (mekanismeFile instanceof File && mekanismeFile.size > 0) {
    mekanismeImage = await uploadPublicImage(mekanismeFile, "layanan/mekanisme");
  }

<<<<<<< HEAD
  let documentUrl = existingDocumentFile;
  if (documentFile instanceof File && documentFile.size > 0) {
    documentUrl = await uploadPublicFile(documentFile, "layanan/dokumen");
  }

  const data = {
    judul,
=======
  let documentFile = formData.get("existingDocumentFile")?.toString() || null;
  let documentName = formData.get("existingDocumentName")?.toString() || null;
  const dokumen = formData.get("documentFile");
  if (dokumen instanceof File && dokumen.size > 0) {
    documentFile = await uploadPublicDocument(dokumen, "layanan/dokumen");
    documentName = dokumen.name;
  }

  const data = {
    nama,
>>>>>>> b42813ae25ac0ef20e7d1d6c29bcd55c1e4aec89
    coverImage,
    deskripsi,
    persyaratan,
    mekanismeImage,
<<<<<<< HEAD
    mekanismeText,
    waktuPelayanan,
    biaya,
    produkLayanan,
    pengaduan,
    documentFile: documentUrl,
    isPublished,
    urutan,
=======
    mekanismeText: mekanismeText || null,
    waktuPelayanan: waktuPelayanan || null,
    biaya: biaya || null,
    produkLayanan: produkLayanan || null,
    pengaduan: pengaduan || null,
    documentFile,
    documentName,
    urutan: Number.isFinite(urutan) ? urutan : 0,
    isPublished,
>>>>>>> b42813ae25ac0ef20e7d1d6c29bcd55c1e4aec89
  };

  if (id) {
    await prisma.serviceStandard.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_SERVICE_STANDARD", id);
  } else {
    await prisma.serviceStandard.create({ data });
<<<<<<< HEAD
    await logAction(user.id, "CREATE_SERVICE_STANDARD", judul);
  }

  revalidatePath("/admin/layanan");
  revalidatePath("/layanan");
  revalidatePath("/");
=======
    await logAction(user.id, "CREATE_SERVICE_STANDARD", nama);
  }

  revalidateLayanan();
>>>>>>> b42813ae25ac0ef20e7d1d6c29bcd55c1e4aec89
  return { success: true };
}

export async function deleteServiceStandard(id: string) {
<<<<<<< HEAD
  const user = await requireRole(OPERATOR_PLUS);
  await prisma.serviceStandard.delete({ where: { id } });
  await logAction(user.id, "DELETE_SERVICE_STANDARD", id);
  revalidatePath("/admin/layanan");
  revalidatePath("/layanan");
  revalidatePath("/");
=======
  const user = await requireAdminSession();
  await prisma.serviceStandard.delete({ where: { id } });
  await logAction(user.id, "DELETE_SERVICE_STANDARD", id);
  revalidateLayanan();
>>>>>>> b42813ae25ac0ef20e7d1d6c29bcd55c1e4aec89
  return { success: true };
}
