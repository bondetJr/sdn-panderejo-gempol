"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage } from "@/lib/supabase/image-upload";
import { logAction, requireRole, STAFF_ANY } from "@/lib/guards";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ---------------------------------------------------------------
// BERITA (News)
// ---------------------------------------------------------------
export async function upsertNews(formData: FormData) {
  const user = await requireRole(STAFF_ANY);

  const id = formData.get("id")?.toString() || undefined;
  const title = formData.get("title")?.toString() ?? "";
  const excerpt = formData.get("excerpt")?.toString() ?? "";
  const content = formData.get("content")?.toString() ?? "";
  const status = formData.get("status")?.toString() ?? "DRAFT";
  const coverFile = formData.get("coverImage");
  const existingCoverUrl = formData.get("existingCoverUrl")?.toString() || null;

  if (!title.trim() || !content.trim()) {
    throw new Error("Judul dan isi berita wajib diisi.");
  }

  let coverImageUrl = existingCoverUrl;
  if (coverFile instanceof File && coverFile.size > 0) {
    coverImageUrl = await uploadPublicImage(coverFile, "news");
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  // Pastikan slug unik
  let counter = 1;
  while (
    await prisma.news.findFirst({
      where: { slug, ...(id ? { NOT: { id } } : {}) },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const data = {
    title,
    slug,
    excerpt: excerpt || null,
    content,
    coverImageUrl,
    status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    authorId: user.id,
  };

  if (id) {
    await prisma.news.update({ where: { id }, data });
    await logAction(user.id, "UPDATE_NEWS", id);
  } else {
    await prisma.news.create({ data });
    await logAction(user.id, "CREATE_NEWS", title);
  }

  revalidatePath("/admin/informasi/berita");
  revalidatePath("/informasi/berita");
  revalidatePath("/informasi/berita", "layout");
  revalidatePath("/");
  return { success: true };
}

export async function deleteNews(id: string) {
  const user = await requireRole(STAFF_ANY);
  await prisma.news.delete({ where: { id } });
  await logAction(user.id, "DELETE_NEWS", id);
  revalidatePath("/admin/informasi/berita");
  revalidatePath("/informasi/berita");
  revalidatePath("/informasi/berita", "layout");
  revalidatePath("/");
  return { success: true };
}

// ---------------------------------------------------------------
// PENGUMUMAN (Announcement)
// ---------------------------------------------------------------
export type AnnouncementInput = {
  id?: string;
  title: string;
  content: string;
  isPenting: boolean;
  expiresAt?: string;
};

export async function upsertAnnouncement(input: AnnouncementInput) {
  const user = await requireRole(STAFF_ANY);

  if (!input.title.trim() || !input.content.trim()) {
    throw new Error("Judul dan isi pengumuman wajib diisi.");
  }

  const data = {
    title: input.title,
    content: input.content,
    isPenting: input.isPenting,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  };

  if (input.id) {
    await prisma.announcement.update({ where: { id: input.id }, data });
    await logAction(user.id, "UPDATE_ANNOUNCEMENT", input.id);
  } else {
    await prisma.announcement.create({ data: { ...data, publishedAt: new Date() } });
    await logAction(user.id, "CREATE_ANNOUNCEMENT", input.title);
  }

  revalidatePath("/admin/informasi/pengumuman");
  revalidatePath("/informasi/pengumuman");
  revalidatePath("/informasi", "layout");
  revalidatePath("/");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const user = await requireRole(STAFF_ANY);
  await prisma.announcement.delete({ where: { id } });
  await logAction(user.id, "DELETE_ANNOUNCEMENT", id);
  revalidatePath("/admin/informasi/pengumuman");
  revalidatePath("/informasi/pengumuman");
  revalidatePath("/informasi", "layout");
  revalidatePath("/");
  return { success: true };
}

// ---------------------------------------------------------------
// GALERI (GalleryAlbum + GalleryPhoto)
// ---------------------------------------------------------------
export type AlbumInput = { id?: string; judul: string; deskripsi?: string };

export async function upsertAlbum(input: AlbumInput) {
  const user = await requireRole(STAFF_ANY);

  if (!input.judul.trim()) throw new Error("Judul album wajib diisi.");

  if (input.id) {
    await prisma.galleryAlbum.update({
      where: { id: input.id },
      data: { judul: input.judul, deskripsi: input.deskripsi || null },
    });
    await logAction(user.id, "UPDATE_ALBUM", input.id);
  } else {
    await prisma.galleryAlbum.create({
      data: { judul: input.judul, deskripsi: input.deskripsi || null },
    });
    await logAction(user.id, "CREATE_ALBUM", input.judul);
  }

  revalidatePath("/admin/informasi/galeri");
  revalidatePath("/informasi/galeri");
  if (input.id) revalidatePath(`/informasi/galeri/${input.id}`);
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteAlbum(id: string) {
  const user = await requireRole(STAFF_ANY);
  await prisma.galleryAlbum.delete({ where: { id } });
  await logAction(user.id, "DELETE_ALBUM", id);
  revalidatePath("/admin/informasi/galeri");
  revalidatePath("/informasi/galeri");
  revalidatePath("/informasi/galeri", "layout");
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function addGalleryPhotos(albumId: string, formData: FormData) {
  const user = await requireRole(STAFF_ANY);

  const files = formData.getAll("photos").filter((f) => f instanceof File) as File[];
  if (files.length === 0) throw new Error("Pilih minimal 1 foto untuk diunggah.");

  const existingCount = await prisma.galleryPhoto.count({ where: { albumId } });

  const urls = await Promise.all(
    files.map((file) => uploadPublicImage(file, `gallery/${albumId}`))
  );

  await prisma.galleryPhoto.createMany({
    data: urls.map((url, idx) => ({
      albumId,
      url,
      urutan: existingCount + idx,
    })),
  });

  // Set cover album otomatis kalau belum ada
  const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
  if (album && !album.coverUrl) {
    await prisma.galleryAlbum.update({
      where: { id: albumId },
      data: { coverUrl: urls[0] },
    });
  }

  await logAction(user.id, "ADD_GALLERY_PHOTOS", `${albumId} (+${urls.length})`);

  revalidatePath(`/admin/informasi/galeri/${albumId}`);
  revalidatePath("/informasi/galeri");
  revalidatePath(`/informasi/galeri/${albumId}`);
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function deleteGalleryPhoto(photoId: string, albumId: string) {
  const user = await requireRole(STAFF_ANY);
  await prisma.galleryPhoto.delete({ where: { id: photoId } });
  await logAction(user.id, "DELETE_GALLERY_PHOTO", photoId);
  revalidatePath(`/admin/informasi/galeri/${albumId}`);
  revalidatePath("/informasi/galeri");
  revalidatePath(`/informasi/galeri/${albumId}`);
  revalidatePath("/kenali-sekolah");
  return { success: true };
}

export async function updateGalleryPhoto(
  photoId: string,
  albumId: string,
  input: { caption: string; deskripsi: string }
) {
  const user = await requireRole(STAFF_ANY);

  if (!input.caption.trim()) throw new Error("Judul gambar wajib diisi.");

  await prisma.galleryPhoto.update({
    where: { id: photoId },
    data: {
      caption: input.caption.trim(),
      deskripsi: input.deskripsi.trim() || null,
    },
  });

  await logAction(user.id, "UPDATE_GALLERY_PHOTO", photoId);
  revalidatePath(`/admin/informasi/galeri/${albumId}`);
  revalidatePath(`/informasi/galeri/${albumId}`);
  return { success: true };
}
