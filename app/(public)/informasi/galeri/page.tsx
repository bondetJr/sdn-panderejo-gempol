import Link from "next/link";
import Image from "next/image";
import { Images, ImageOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getAllGalleryAlbums } from "@/lib/informasi-data";

export const metadata = {
  title: "Kegiatan Siswa",
};

export default async function GaleriPage() {
  const albums = await getAllGalleryAlbums();

  return (
    <>
      <PageHeader
        title="Kegiatan Siswa"
        description="Dokumentasi momen-momen kegiatan siswa dan sekolah."
        breadcrumbs={[
          { label: "Informasi", href: "/informasi/berita" },
          { label: "Kegiatan Siswa" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {albums.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-neutral-slate">
              Belum ada album kegiatan siswa.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/informasi/galeri/${album.id}`}
                className="group overflow-hidden rounded-card bg-white shadow-soft transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {album.coverUrl ? (
                    <Image
                      src={album.coverUrl}
                      alt={album.judul}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-teal/10">
                      <ImageOff className="h-10 w-10 text-primary-teal-deep/40" />
                    </div>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-neutral-graphite/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    <Images className="h-3 w-3" />
                    {album.jumlahFoto} foto
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold leading-snug text-neutral-espresso group-hover:text-primary-teal-deep">
                    {album.judul}
                  </h3>
                  {album.deskripsi && (
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-slate line-clamp-2">
                      {album.deskripsi}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
