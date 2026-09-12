"use client";

import { useState } from "react";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { X, ImageOff } from "lucide-react";
import type { FlagshipProgramItem } from "@/lib/program-unggulan-data";

function getIcon(name: string): LucideIcon {
  return (LucideIcons[name as keyof typeof LucideIcons] as LucideIcon) ?? LucideIcons.Sparkles;
}

export function ProgramUnggulan({ programs }: { programs: FlagshipProgramItem[] }) {
  const [selected, setSelected] = useState<FlagshipProgramItem | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-primary-teal">
          Keunggulan Kami
        </span>
        <h2 className="mt-1.5 text-xl font-extrabold text-neutral-espresso sm:text-2xl">
          Program Unggulan Sekolah
        </h2>
        <p className="mt-1.5 text-xs text-neutral-slate sm:text-sm">
          Klik salah satu program untuk melihat penjelasan & dokumentasi kegiatannya.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {programs.map((program) => {
          const Icon = getIcon(program.icon);
          return (
            <button
              key={program.id}
              type="button"
              onClick={() => setSelected(program)}
              className="flex flex-col items-center rounded-card bg-white p-4 text-center shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-teal/10 text-primary-teal-deep">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-2.5 text-xs font-bold leading-snug text-neutral-espresso line-clamp-2">
                {program.nama}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Modal detail program */}
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
                <div className="flex h-full items-center justify-center">
                  <ImageOff className="h-10 w-10 text-primary-teal-deep/30" />
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
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                  {(() => {
                    const Icon = getIcon(selected.icon);
                    return <Icon className="h-4 w-4" />;
                  })()}
                </span>
                <h3 className="text-sm font-bold text-neutral-espresso">
                  {selected.nama}
                </h3>
              </div>
              <p className="text-justify mt-3 text-sm leading-relaxed text-neutral-espresso/80">
                {selected.deskripsiLengkap}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
