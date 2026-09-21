"use server";

import { revalidatePath } from "next/cache";
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
  revalidatePath("/");
}

export async function upsertServiceStandard(formData: FormData) {
  const user = await requireAdminSession();

  const id = formData.get("id")?.toString() || undefined;
  // support nama (baru) dan judul (lama)
  const nama = (formData.get("nama")?.toString().trim() || formData.get("judul")?.toString().trim() || "");
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
  if (coverFile instanceof File && coverFile.size > 0) {
    coverImage = await uploadPublicImage(coverFile, "layanan/cover");
  }

  let mekanismeImage = formData.get("existingMekanismeImage")?.toString() || null;
  const mekanismeFile = formData.get("mekanismeImage");
  if (mekanismeFile instanceof File && mekanismeFile.size > 0) {
    mekanismeImage = await uploadPublicImage(mekanismeFile, "layanan/mekanisme");
  }

  let documentFile = formData.get("existingDocumentFile")?.toString() || null;
  let documentName = formData.get("existingDocumentName")?.toString() || null;
  const dokumen = formData.get("documentFile");
  if (dokumen instanceof File && dokumen.size > 0) {
    documentFile = await uploadPublicDocument(dokumen, "layanan/dokumen");
    documentName = dokumen.name;
  }

  const data = {
    nama,
    judul: nama,
    coverImage,
    deskripsi,
    persyaratan,
    mekanismeImage,
    mekanismeText: mekanismeText || null,
    waktuPelayanan: waktuPelayanan || null,
    biaya: biaya || null,
    produkLayanan: produkLayanan || null,
    pengaduan: pengaduan || null,
    documentFile,
    documentName,
    urutan: Number.isFinite(urutan) ? urutan : 0,
    isPublished,
  };

  if (id) {
    await prisma.serviceStandard.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_SERVICE_STANDARD", id);
  } else {
    const created = await prisma.serviceStandard.create({ data });
    await logAction(user.id, "CREATE_SERVICE_STANDARD", created.id);
  }

  revalidateLayanan();
  return { success: true };
}

export async function deleteServiceStandard(id: string) {
  const user = await requireAdminSession();
  await prisma.serviceStandard.delete({ where: { id } });
  await logAction(user.id, "DELETE_SERVICE_STANDARD", id);
  revalidateLayanan();
  return { success: true };
}