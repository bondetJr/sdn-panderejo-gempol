"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Photo = {
  id: string;
  url: string;
  caption?: string | null;
  deskripsi?: string | null;
};

export function PhotoLightbox({ photos }: { photos: Photo[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  function close() {
    setActiveIdx(null);
  }
  function prev(e?: React.MouseEvent) {
    e?.stopPropagation();
    setActiveIdx((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }
  function next(e?: React.MouseEvent) {
    e?.stopPropagation();
    setActiveIdx((i) => (i === null ? null : (i + 1) % photos.length));
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className="group relative aspect-square overflow-hidden rounded-2xl shadow-soft"
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? "Foto kegiatan siswa"}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {(photo.caption || photo.deskripsi) && (
              <div className="absolute inset-x-0 bottom-0 bg-neutral-graphite/75 p-2 text-left text-white">
                {photo.caption && <p className="text-xs font-bold">{photo.caption}</p>}
                {photo.deskripsi && <p className="mt-0.5 line-clamp-2 text-[10px]">{photo.deskripsi}</p>}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {activeIdx !== null && (
        <div
          onClick={close}
          className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-graphite/90 p-4"
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Sebelumnya"
            onClick={prev}
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative aspect-[4/3] w-full max-w-3xl"
          >
            <Image
              src={photos[activeIdx].url}
              alt={photos[activeIdx].caption ?? "Foto kegiatan siswa"}
              fill
              className="object-contain"
              sizes="768px"
            />
          </div>

          <button
            type="button"
            aria-label="Berikutnya"
            onClick={next}
            className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {(photos[activeIdx].caption || photos[activeIdx].deskripsi) && (
            <div className="absolute bottom-6 left-1/2 w-[min(90%,48rem)] -translate-x-1/2 rounded-2xl bg-neutral-graphite/75 px-4 py-3 text-center text-white backdrop-blur">
              {photos[activeIdx].caption && <p className="text-sm font-bold">{photos[activeIdx].caption}</p>}
              {photos[activeIdx].deskripsi && <p className="mt-1 text-xs text-white/85">{photos[activeIdx].deskripsi}</p>}
            </div>
          )}
        </div>
      )}
    </>
  );
}
