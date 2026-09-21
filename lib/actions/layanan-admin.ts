"use server";

import { revalidatePath } from "next/cache";
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
  if (coverFile instanceof File && coverFile.size > 0) {
    coverImage = await uploadPublicImage(coverFile, "layanan/cover");
  }

  let mekanismeImage = existingMekanismeImage;
  if (mekanismeFile instanceof File && mekanismeFile.size > 0) {
    mekanismeImage = await uploadPublicImage(mekanismeFile, "layanan/mekanisme");
  }

  let documentUrl = existingDocumentFile;
  if (documentFile instanceof File && documentFile.size > 0) {
    documentUrl = await uploadPublicFile(documentFile, "layanan/dokumen");
  }

  const data = {
    judul,
    coverImage,
    deskripsi,
    persyaratan,
    mekanismeImage,
    mekanismeText,
    waktuPelayanan,
    biaya,
    produkLayanan,
    pengaduan,
    documentFile: documentUrl,
    isPublished,
    urutan,
  };

  if (id) {
    await prisma.serviceStandard.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_SERVICE_STANDARD", id);
  } else {
    await prisma.serviceStandard.create({ data });
    await logAction(user.id, "CREATE_SERVICE_STANDARD", judul);
  }

  revalidatePath("/admin/layanan");
  revalidatePath("/layanan");
  revalidatePath("/");
  return { success: true };
}

export async function deleteServiceStandard(id: string) {
  const user = await requireRole(OPERATOR_PLUS);
  await prisma.serviceStandard.delete({ where: { id } });
  await logAction(user.id, "DELETE_SERVICE_STANDARD", id);
  revalidatePath("/admin/layanan");
  revalidatePath("/layanan");
  revalidatePath("/");
  return { success: true };
}
