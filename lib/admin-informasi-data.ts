import { prisma } from "@/lib/prisma";

export async function getAllNewsAdmin() {
  try {
    const data = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
    });
    return data;
  } catch {
    return [];
  }
}

export async function getNewsByIdAdmin(id: string) {
  try {
    return await prisma.news.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function getAllAnnouncementsAdmin() {
  try {
    return await prisma.announcement.findMany({
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getAllAlbumsAdmin() {
  try {
    const data = await prisma.galleryAlbum.findMany({
      include: { _count: { select: { photos: true } } },
      orderBy: { createdAt: "desc" },
    });
    return data;
  } catch {
    return [];
  }
}

export async function getAlbumWithPhotosAdmin(id: string) {
  try {
    return await prisma.galleryAlbum.findUnique({
      where: { id },
      include: { photos: { orderBy: { urutan: "asc" } } },
    });
  } catch {
    return null;
  }
}
