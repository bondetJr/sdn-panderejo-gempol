"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, UserRound, Palette, X, ImageOff } from "lucide-react";

type EkskulItem = {
  id: string;
  nama: string;
  deskripsi: string | null;
  jadwal: string | null;
  fotoUrl: string | null;
  pembina: { nama: string } | null;
};

export function EkstrakurikulerGrid({ ekskul }: { ekskul: EkskulItem[] }) {
  const [selected, setSelected] = useState<EkskulItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ekskul.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setSelected(e)}
            className="overflow-hidden rounded-card bg-white text-left shadow-soft transition-transform hover:-translate-y-1"
          >
            <div className="relative flex h-36 items-center justify-center bg-primary-teal/10">
              {e.fotoUrl ? (
                <Image
                  src={e.fotoUrl}
                  alt={e.nama}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              ) : (
                <Palette className="h-10 w-10 text-primary-teal-deep" />
              )}
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-neutral-espresso">
                {e.nama}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-slate line-clamp-2">
                {e.deskripsi}
              </p>
              <div className="mt-4 space-y-1.5 border-t border-neutral-espresso/10 pt-3">
                {e.jadwal && (
                  <p className="flex items-center gap-2 text-xs text-neutral-slate">
                    <Clock className="h-3.5 w-3.5 text-primary-teal" />
                    {e.jadwal}
                  </p>
                )}
                {e.pembina && (
                  <p className="flex items-center gap-2 text-xs text-neutral-slate">
                    <UserRound className="h-3.5 w-3.5 text-primary-teal" />
                    Pembina: {e.pembina.nama}
                  </p>
                )}
              </div>
              <span className="mt-3 inline-block text-[11px] font-semibold text-primary-teal-deep">
                Lihat detail →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal detail ekstrakurikuler */}
      {selected && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-graphite/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-card bg-white shadow-soft"
          >
            <div className="relative aspect-video bg-primary-teal/10">
              {selected.fotoUrl ? (
                <Image
                  src={selected.fotoUrl}
                  alt={selected.nama}
                  fill
                  className="object-cover"
                  sizes="450px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-primary-teal-deep/40">
                  <ImageOff className="h-10 w-10" />
                  <p className="text-xs">Belum ada foto kegiatan</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Tutup"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-espresso hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-base font-bold text-neutral-espresso">
                {selected.nama}
              </h3>
              {selected.deskripsi && (
                <p className="text-justify mt-2 text-sm leading-relaxed text-neutral-espresso/80">
                  {selected.deskripsi}
                </p>
              )}
              <div className="mt-4 space-y-1.5 border-t border-neutral-espresso/10 pt-3">
                {selected.jadwal && (
                  <p className="flex items-center gap-2 text-xs text-neutral-slate">
                    <Clock className="h-3.5 w-3.5 text-primary-teal" />
                    {selected.jadwal}
                  </p>
                )}
                {selected.pembina && (
                  <p className="flex items-center gap-2 text-xs text-neutral-slate">
                    <UserRound className="h-3.5 w-3.5 text-primary-teal" />
                    Pembina: {selected.pembina.nama}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
