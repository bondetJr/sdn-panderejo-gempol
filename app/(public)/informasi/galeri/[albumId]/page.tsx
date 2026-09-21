import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PhotoLightbox } from "@/components/informasi/PhotoLightbox";
import { getGalleryAlbumById } from "@/lib/informasi-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ albumId: string }>;
}): Promise<Metadata> {
  const { albumId } = await params;
  const album = await getGalleryAlbumById(albumId);

  if (!album) {
    return {
      title: "Album Tidak Ditemukan",
      description: "Album galeri yang Anda cari tidak tersedia.",
    };
  }

  return {
    title: album.judul,
    description:
      album.deskripsi ||
      `Dokumentasi kegiatan ${album.judul} di SDN Panderejo Gempol.`,
  };
}

export default async function GaleriAlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const album = await getGalleryAlbumById(albumId);

  if (!album) notFound();

  return (
    <>
      <PageHeader
        title={album.judul}
        description={album.deskripsi ?? undefined}
        breadcrumbs={[
          { label: "Informasi", href: "/informasi/berita" },
          { label: "Kegiatan Siswa", href: "/informasi/galeri" },
          { label: album.judul },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {album.photos.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-neutral-slate">
              Belum ada foto di album ini.
            </p>
          </div>
        ) : (
          <PhotoLightbox photos={album.photos} />
        )}
      </section>
    </>
  );
}
