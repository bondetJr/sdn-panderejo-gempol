import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { getAlbumWithPhotosAdmin } from "@/lib/admin-informasi-data";
import { AlbumPhotoManager } from "@/components/admin/AlbumPhotoManager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ albumId: string }>;
}): Promise<Metadata> {
  const { albumId } = await params;
  const album = await getAlbumWithPhotosAdmin(albumId);

  return {
    title: album ? `${album.judul} - Kelola Album` : "Album Tidak Ditemukan",
    description: album
      ? `Kelola ${album.photos.length} foto pada album ${album.judul}.`
      : "Album galeri yang Anda cari tidak ditemukan.",
  };
}

export default async function AdminAlbumDetailPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const album = await getAlbumWithPhotosAdmin(albumId);

  if (!album) notFound();

  return (
    <div>
      <Link
        href="/admin/informasi/galeri"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-slate hover:text-primary-teal-deep"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Daftar Album
      </Link>

      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-neutral-espresso">
          {album.judul}
        </h2>
        {album.deskripsi && (
          <p className="text-sm text-neutral-slate">{album.deskripsi}</p>
        )}
      </div>

      <AlbumPhotoManager albumId={album.id} photos={album.photos} />
    </div>
  );
}
