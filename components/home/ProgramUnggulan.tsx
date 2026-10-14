"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { X, ArrowUpRight, Sparkles, Eye, MousePointerClick } from "lucide-react";
import type { FlagshipProgramItem } from "@/lib/program-unggulan-data";

function getIcon(name: string): LucideIcon {
  return (LucideIcons[name as keyof typeof LucideIcons] as LucideIcon) ?? LucideIcons.Sparkles;
}

// 6 abstract gradient themes - semua masih dalam ekosistem warna website
// Token: #0a5c5c (teal deep), #1db5a8 (teal), #aad9f4 (teal light), #fbe49d (butter), #dac8ae (pale oak), #592720 (espresso), #536878 (slate)
const CARD_THEMES = [
  {
    // 0 Tahfidz - Deep Teal Dawn
    wrapper: "from-[#0a5c5c]/[0.08] via-[#1db5a8]/[0.06] to-[#fbe49d]/[0.18]",
    blobs: [
      { cls: "bg-[#1db5a8]/20", top: -20, left: -18, w: 90, h: 90 },
      { cls: "bg-[#fbe49d]/35", top: undefined, left: undefined, bottom: -12, right: -10, w: 70, h: 70 },
      { cls: "bg-[#0a5c5c]/10", top: 45, left: 60, w: 40, h: 40, isPercent: true },
    ],
    iconWrap: "bg-white/85",
    icon: "text-[#0a5c5c]",
  },
  {
    // 1 Literasi - Butter Morning
    wrapper: "from-[#fbe49d]/[0.32] via-[#dac8ae]/[0.18] to-[#aad9f4]/[0.14]",
    blobs: [
      { cls: "bg-[#fbe49d]/40", top: -15, right: -12, w: 85, h: 85 },
      { cls: "bg-[#aad9f4]/25", bottom: -18, left: -14, w: 75, h: 75 },
      { cls: "bg-[#dac8ae]/20", top: 50, left: 20, w: 35, h: 35, isPercent: true },
    ],
    iconWrap: "bg-white/90",
    icon: "text-[#592720]",
  },
  {
    // 2 Sains - Teal Lab
    wrapper: "from-[#aad9f4]/[0.22] via-[#1db5a8]/[0.08] to-[#f8f7f4]/0",
    blobs: [
      { cls: "bg-[#aad9f4]/30", top: -10, left: -10, w: 100, h: 60, rotate: -12 },
      { cls: "bg-[#1db5a8]/[0.18]", bottom: -10, right: 20, w: 60, h: 60, isPercentRight: true },
      { cls: "bg-[#0a5c5c]/[0.08]", top: 30, right: -8, w: 45, h: 45, isPercentTop: true },
    ],
    iconWrap: "bg-white/85",
    icon: "text-[#0a5c5c]",
  },
  {
    // 3 Seni Budaya - Pale Oak Heritage
    wrapper: "from-[#dac8ae]/[0.28] via-[#fbe49d]/[0.14] to-[#592720]/[0.06]",
    blobs: [
      { cls: "bg-[#dac8ae]/35", top: -18, left: 30, w: 90, h: 50, isPercentLeft: true, rotate: 8 },
      { cls: "bg-[#592720]/10", bottom: -15, right: -12, w: 80, h: 80 },
      { cls: "bg-[#fbe49d]/25", top: 15, right: 15, w: 30, h: 30, isPercentTop: true },
    ],
    iconWrap: "bg-white/90",
    icon: "text-[#592720]",
  },
  {
    // 4 Pramuka - Forest Cloud
    wrapper: "from-[#0a5c5c]/[0.07] via-[#536878]/[0.06] to-[#fbe49d]/[0.20]",
    blobs: [
      { cls: "bg-[#536878]/[0.12]", top: -12, left: -15, w: 70, h: 70 },
      { cls: "bg-[#fbe49d]/30", bottom: -10, right: -8, w: 90, h: 50, rotate: -8 },
      { cls: "bg-[#0a5c5c]/10", top: 55, right: 25, w: 38, h: 38, isPercentTop: true },
    ],
    iconWrap: "bg-white/85",
    icon: "text-[#536878]",
  },
  {
    // 5 English - Sky Butter
    wrapper: "from-[#aad9f4]/[0.18] via-[#f8f7f4]/0 to-[#fbe49d]/[0.24]",
    blobs: [
      { cls: "bg-[#aad9f4]/28", top: -20, right: -15, w: 80, h: 80 },
      { cls: "bg-[#fbe49d]/32", bottom: -14, left: -12, w: 85, h: 55, rotate: 12 },
      { cls: "bg-[#1db5a8]/12", top: 40, left: 55, w: 32, h: 32, isPercent: true },
    ],
    iconWrap: "bg-white/90",
    icon: "text-[#0a5c5c]",
  },
];

export function ProgramUnggulan({ programs }: { programs: FlagshipProgramItem[] }) {
  const [selected, setSelected] = useState<FlagshipProgramItem | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-espresso/10 bg-white px-3 py-1 shadow-soft">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary-teal" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-espresso">
              Ketuk untuk eksplor
            </span>
          </div>
          <h2 className="mt-3 text-[20px] font-extrabold leading-tight text-neutral-espresso sm:text-[26px]">
            Program Unggulan Sekolah
          </h2>
          <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-neutral-slate sm:text-[13.5px]">
            6 program pilihan dengan warna identitas. <span className="font-bold text-neutral-espresso">Tap kartu</span> untuk detail.
          </p>
        </div>
        <Link
          href="/akademik/program-unggulan"
          className="hidden items-center gap-1.5 rounded-button bg-neutral-espresso px-4 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-graphite sm:inline-flex"
        >
          Lihat semua
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid icon-only compact + abstract gradient */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {programs.map((program, idx) => {
          const Icon = getIcon(program.icon);
          const theme = CARD_THEMES[idx % CARD_THEMES.length];
          const isActive = activeId === program.id;
          return (
            <button
              key={program.id}
              type="button"
              onClick={() => {
                setActiveId(program.id);
                setSelected(program);
                setTimeout(() => setActiveId(null), 300);
              }}
              className={`group relative flex flex-col overflow-hidden rounded-[20px] border bg-white p-4 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-teal active:scale-[0.98]
                ${isActive ? "border-primary-teal/30 shadow-[0_12px_28px_rgba(29,181,168,0.18)]" : "border-neutral-espresso/[0.06] hover:border-primary-teal/20 hover:shadow-[0_12px_28px_rgba(10,92,92,0.10)]"}
              `}
            >
              {/* Abstract gradient layer - NOT solid */}
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.wrapper}`} />
              {/* Abstract blobs - gradient, not solid */}
              {theme.blobs.map((blob: any, bIdx: number) => {
                const style: any = {
                  width: blob.w,
                  height: blob.h,
                  position: 'absolute',
                };
                if (blob.top !== undefined) style.top = blob.isPercent || blob.isPercentTop ? `${blob.top}%` : blob.top;
                if (blob.bottom !== undefined) style.bottom = blob.bottom;
                if (blob.left !== undefined) style.left = blob.isPercent || blob.isPercentLeft ? `${blob.left}%` : blob.left;
                if (blob.right !== undefined) style.right = blob.isPercentRight ? `${blob.right}%` : blob.right;
                if (blob.rotate) style.transform = `rotate(${blob.rotate}deg)`;
                return (
                  <span
                    key={bIdx}
                    className={`pointer-events-none absolute rounded-full blur-[18px] transition-transform duration-500 group-hover:scale-110 ${blob.cls}`}
                    style={style}
                  />
                );
              })}
              {/* Subtle grain / dot pattern */}
              <span className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply" style={{
                backgroundImage: `radial-gradient(#592720 1px, transparent 1px)`,
                backgroundSize: '14px 14px'
              }} />

              {/* Content - above gradient */}
              <div className="relative z-10 flex flex-col">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <span className={`relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-soft backdrop-blur transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 ${theme.iconWrap}`}>
                    <Icon className={`h-6 w-6 transition-colors ${theme.icon}`} strokeWidth={2} />
                    {/* inner glow on hover */}
                    <span className="absolute inset-0 rounded-2xl bg-white/0 transition-colors group-hover:bg-white/20" />
                  </span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-espresso/[0.06] text-neutral-espresso backdrop-blur transition-all duration-300 group-hover:bg-accent-lime group-hover:text-neutral-graphite group-hover:rotate-45">
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-4 line-clamp-2 min-h-[36px] text-[13px] font-extrabold leading-snug text-neutral-espresso sm:text-[13.5px]">
                  {program.nama}
                </h3>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-slate transition-colors group-hover:text-primary-teal-deep">
                    <Eye className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                    <span className="relative">
                      Lihat
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary-teal-deep transition-all duration-300 group-hover:w-full" />
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-espresso/30 sm:hidden">
                    <MousePointerClick className="h-3 w-3" />
                    Tap
                  </span>
                </div>
              </div>

              {/* Number */}
              <span className="pointer-events-none absolute bottom-3 right-3 z-10 text-[10px] font-bold text-neutral-espresso/15 group-hover:text-neutral-espresso/25">
                0{idx + 1}
              </span>

              {/* Active ring */}
              <span className="pointer-events-none absolute inset-0 rounded-[20px] ring-0 transition-all group-active:ring-2 group-active:ring-primary-teal/20" />
            </button>
          );
        })}
      </div>

      {/* Mobile full link */}
      <Link
        href="/akademik/program-unggulan"
        className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-button border border-neutral-espresso/10 bg-white px-4 py-3 text-xs font-bold text-neutral-espresso shadow-soft transition-colors hover:bg-neutral-espresso hover:text-white sm:hidden"
      >
        Jelajahi semua program
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-neutral-graphite/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.24)] sm:max-w-[480px] sm:rounded-card"
          >
            <div className="flex justify-center py-3 sm:hidden">
              <span className="h-1.5 w-10 rounded-full bg-neutral-espresso/15" />
            </div>

            <div className="p-6">
              {(() => {
                const idx = programs.findIndex(p => p.id === selected.id);
                const theme = CARD_THEMES[idx >=0 ? idx % CARD_THEMES.length : 0];
                const Icon = getIcon(selected.icon);
                return (
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.wrapper} shadow-soft`}>
                      <Icon className={`h-6 w-6 ${theme.icon}`} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-base-cloud text-neutral-espresso hover:bg-neutral-espresso/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })()}

              <h3 className="mt-4 text-[16px] font-extrabold leading-tight text-neutral-espresso">
                {selected.nama}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-espresso/80">
                {selected.deskripsiSingkat}
              </p>

              {selected.fotoUrl && (
                <div className="relative mt-4 aspect-video overflow-hidden rounded-button bg-base-cloud">
                  <Image src={selected.fotoUrl} alt={selected.nama} fill className="object-cover" unoptimized />
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <Link
                  href="/akademik/program-unggulan"
                  onClick={() => setSelected(null)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-button bg-primary-teal-deep px-4 py-3 text-[13px] font-bold text-white"
                >
                  Lihat halaman lengkap
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-button border border-neutral-espresso/10 bg-white px-4 py-3 text-[13px] font-bold text-neutral-espresso"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
