"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, ImageOff, X } from "lucide-react";
import { TINGKAT_LABEL } from "@/lib/profil-data";

type AchievementItem = {
  id: string;
  judul: string;
  tingkat: string;
  tahun: number;
  deskripsi: string | null;
  fotoUrl: string | null;
  atasNamaSiswa: string | null;
};

const TINGKAT_COLOR: Record<string, string> = {
  SEKOLAH: "bg-neutral-slate/10 text-neutral-slate",
  KECAMATAN: "bg-primary-teal/10 text-primary-teal-deep",
  KABUPATEN: "bg-primary-teal-deep/10 text-primary-teal-deep",
  PROVINSI: "bg-joy-butter/60 text-neutral-espresso",
  NASIONAL: "bg-accent-lime/20 text-neutral-graphite",
};

export function AchievementGrid({ achievements }: { achievements: AchievementItem[] }) {
  const [selected, setSelected] = useState<AchievementItem | null>(null);

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {achievements.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelected(a)}
            className="flex items-start gap-3 rounded-card bg-white p-5 text-left shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
              <Award className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-neutral-espresso sm:text-base">
                {a.judul}
              </p>
              {a.atasNamaSiswa && (
                <p className="mt-0.5 text-xs text-neutral-slate">{a.atasNamaSiswa}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    TINGKAT_COLOR[a.tingkat] ?? TINGKAT_COLOR.SEKOLAH
                  }`}
                >
                  {TINGKAT_LABEL[a.tingkat] ?? a.tingkat}
                </span>
                <span className="text-xs font-semibold text-neutral-slate">
                  {a.tahun}
                </span>
                {a.fotoUrl && (
                  <span className="text-[11px] font-medium text-primary-teal-deep">
                    Lihat foto →
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal detail prestasi */}
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
                  alt={selected.judul}
                  fill
                  className="object-cover"
                  sizes="450px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-primary-teal-deep/40">
                  <ImageOff className="h-10 w-10" />
                  <p className="text-xs">Belum ada foto untuk prestasi ini</p>
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
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    TINGKAT_COLOR[selected.tingkat] ?? TINGKAT_COLOR.SEKOLAH
                  }`}
                >
                  {TINGKAT_LABEL[selected.tingkat] ?? selected.tingkat}
                </span>
                <span className="text-xs font-semibold text-neutral-slate">
                  {selected.tahun}
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-neutral-espresso">
                {selected.judul}
              </h3>
              {selected.atasNamaSiswa && (
                <p className="mt-0.5 text-sm text-neutral-slate">
                  {selected.atasNamaSiswa}
                </p>
              )}
              {selected.deskripsi && (
                <p className="mt-3 text-sm leading-relaxed text-neutral-espresso/80">
                  {selected.deskripsi}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
