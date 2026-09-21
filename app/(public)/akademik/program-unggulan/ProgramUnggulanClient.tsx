"use client";

import { useState } from "react";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ChevronDown, Sparkles } from "lucide-react";

type Program = {
  id: string;
  nama: string;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  fotoUrl: string | null;
  realisasiText: string | null;
  impactUtama: string | null;
  impactSatu: string | null;
  impactDua: string | null;
  impactTiga: string | null;
  icon: string;
  subImages: { id: string; url: string; urutan: number }[];
};

function getIcon(name: string): LucideIcon {
  return (
    (LucideIcons[name as keyof typeof LucideIcons] as LucideIcon | undefined) ??
    LucideIcons.Sparkles
  );
}

export function ProgramUnggulanClient({ programs }: { programs: Program[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-teal">
            Eksplorasi program
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-neutral-espresso sm:text-2xl">
            Tumbuh bersama sekolah
          </h2>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-relaxed text-neutral-slate sm:block">
          Pilih kartu untuk melihat cerita, dokumentasi, dan dampaknya bagi siswa.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {programs.map((program, index) => {
          const Icon = getIcon(program.icon);
          const isExpanded = expandedId === program.id;

          return (
            <article
              key={program.id}
              className={`group overflow-hidden rounded-card border bg-white shadow-soft transition-all duration-300 ${
                isExpanded
                  ? "border-primary-teal/30 shadow-lg shadow-primary-teal/10"
                  : "border-transparent hover:-translate-y-1 hover:shadow-lg"
              }`}
            >
              <div className="relative aspect-[16/8] overflow-hidden bg-primary-teal/10">
                {program.fotoUrl ? (
                  <>
                    <Image
                      src={program.fotoUrl}
                      alt={program.nama}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Icon
                      className="h-14 w-14 text-primary-teal-deep/25 transition-transform duration-500 group-hover:scale-110"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-graphite/75 via-neutral-graphite/5 to-transparent" />
                <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm font-extrabold text-primary-teal-deep shadow-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  Program pilihan sekolah
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-teal/10 text-primary-teal-deep">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-extrabold leading-tight text-neutral-espresso">
                      {program.nama}
                    </h2>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-primary-teal-deep">
                      {program.deskripsiSingkat}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`program-detail-${program.id}`}
                  onClick={() => setExpandedId(isExpanded ? null : program.id)}
                  className="mt-5 flex w-full items-center justify-between rounded-2xl border border-primary-teal/15 bg-primary-teal/5 px-4 py-3 text-left text-xs font-extrabold text-primary-teal-deep transition-colors hover:bg-primary-teal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-teal focus-visible:ring-offset-2"
                >
                  <span>{isExpanded ? "Sembunyikan detail" : "Lihat detail program"}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={`program-detail-${program.id}`}
                  aria-hidden={!isExpanded}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                    isExpanded ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="text-justify text-sm leading-7 text-neutral-espresso/75">
                      {program.deskripsiLengkap}
                    </p>

                    {program.realisasiText && (
                      <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
                        <p className="font-extrabold uppercase tracking-wide text-amber-700">
                          Realisasi kegiatan
                        </p>
                        <p className="mt-1.5">{program.realisasiText}</p>
                      </div>
                    )}

                    {program.subImages.length > 0 && (
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {program.subImages.map((image) => (
                          <div
                            key={image.id}
                            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-primary-teal/5"
                          >
                            <Image
                              src={image.url}
                              alt={`${program.nama} - kegiatan`}
                              fill
                              className="object-cover transition-transform duration-500 hover:scale-105"
                              sizes="200px"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {(program.impactUtama ||
                      program.impactSatu ||
                      program.impactDua ||
                      program.impactTiga) && (
                      <div className="mt-5 rounded-2xl bg-primary-teal/5 p-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wide text-primary-teal-deep">
                          Impact ke Siswa
                        </h3>
                        {program.impactUtama && (
                          <p className="mt-2 text-sm font-bold text-neutral-espresso">
                            {program.impactUtama}
                          </p>
                        )}
                        <ul className="mt-2 space-y-2 text-xs leading-relaxed text-neutral-espresso/75">
                          {[program.impactSatu, program.impactDua, program.impactTiga]
                            .filter((impact): impact is string => Boolean(impact))
                            .map((impact) => (
                              <li key={impact} className="flex gap-2">
                                <span className="mt-0.5 text-primary-teal">✓</span>
                                <span>{impact}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    <a
                      href="#konten-utama"
                      className="mt-5 inline-flex items-center gap-1 text-xs font-extrabold text-primary-teal-deep hover:text-primary-teal"
                    >
                      Kembali ke daftar program
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
