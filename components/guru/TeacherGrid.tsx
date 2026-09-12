"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  User,
  BadgeCheck,
  Crown,
  GraduationCap,
  Briefcase,
  Users,
  Mars,
  Venus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeacherCard } from "@/lib/teacher-data";

const STATUS_LABEL: Record<TeacherCard["statusKepegawaian"], string> = {
  PNS: "PNS",
  PPPK: "PPPK",
  HONORER: "Honorer",
};

const STATUS_BADGE: Record<TeacherCard["statusKepegawaian"], string> = {
  PNS: "bg-primary-teal/10 text-primary-teal-deep",
  PPPK: "bg-sky-50 text-sky-700",
  HONORER: "bg-amber-50 text-amber-700",
};

type StatusFilter = "SEMUA" | TeacherCard["statusKepegawaian"];

/** Klasifikasi sederhana: Kepala Sekolah > jabatan mengandung "guru" > sisanya tendik. */
function classify(t: TeacherCard): "kepsek" | "guru" | "tendik" {
  if (t.isKepalaSekolah) return "kepsek";
  if (t.jabatan.toLowerCase().includes("guru")) return "guru";
  return "tendik";
}

export function TeacherGrid({ teachers }: { teachers: TeacherCard[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("SEMUA");

  const summary = useMemo(() => {
    let kepsek = 0, guru = 0, tendik = 0;
    for (const t of teachers) {
      const kind = classify(t);
      if (kind === "kepsek") kepsek++;
      else if (kind === "guru") guru++;
      else tendik++;
    }
    const lakiLaki = teachers.filter((t) => t.jenisKelamin === "L").length;
    const perempuan = teachers.filter((t) => t.jenisKelamin === "P").length;
    return { kepsek, guru, tendik, total: kepsek + guru + tendik, lakiLaki, perempuan };
  }, [teachers]);

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const matchStatus = status === "SEMUA" || t.statusKepegawaian === status;
      const matchQuery =
        query.trim() === "" ||
        t.nama.toLowerCase().includes(query.toLowerCase()) ||
        t.jabatan.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [teachers, query, status]);

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: "Semua", value: "SEMUA" },
    { label: "PNS", value: "PNS" },
    { label: "PPPK", value: "PPPK" },
    { label: "Honorer", value: "HONORER" },
  ];

  return (
    <div>
      {/* Toolbar: Search + Filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-slate" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau jabatan..."
              className="w-full rounded-button border border-neutral-espresso/10 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-espresso placeholder:text-neutral-slate focus:border-primary-teal focus:outline-none focus:ring-2 focus:ring-primary-teal/20"
            />
          </div>

        </div>

        <div className="flex flex-wrap gap-2">
          {filterButtons.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={cn(
                "rounded-button px-4 py-2 text-xs font-bold transition-colors",
                status === f.value
                  ? "bg-primary-teal text-white shadow-soft"
                  : "bg-white text-neutral-espresso hover:bg-primary-teal/10"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-card bg-white p-4 shadow-soft sm:p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(180px,0.8fr)_minmax(0,2fr)]">
          <div className="flex items-center gap-3 rounded-2xl bg-primary-teal/10 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-teal text-white">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <p className="text-3xl font-extrabold text-primary-teal-deep">
                {summary.total}
              </p>
              <p className="text-xs font-semibold text-neutral-slate">
                Jumlah Guru & Staff
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-extrabold text-neutral-espresso">
              Rincian Statistik
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <SummaryBadge
                icon={Crown}
                label="Kepala Sekolah"
                value={summary.kepsek}
                className="bg-joy-butter/50"
                iconClassName="bg-joy-butter text-neutral-espresso"
              />
              <SummaryBadge
                icon={GraduationCap}
                label="Tenaga Pendidik"
                value={summary.guru}
                className="bg-primary-teal/5"
              />
              <SummaryBadge
                icon={Briefcase}
                label="Tenaga Kependidikan"
                value={summary.tendik}
                className="bg-amber-50"
                iconClassName="bg-amber-100 text-amber-700"
              />
              <SummaryBadge
                icon={Mars}
                label="Laki-laki"
                value={summary.lakiLaki}
                className="bg-sky-50"
                iconClassName="bg-sky-100 text-sky-700"
              />
              <SummaryBadge
                icon={Venus}
                label="Perempuan"
                value={summary.perempuan}
                className="bg-rose-50"
                iconClassName="bg-rose-100 text-rose-700"
              />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-slate">
        Menampilkan {filtered.length} dari {teachers.length} Tenaga Pendidik & Tenaga
        Kependidikan
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-card bg-white p-10 text-center shadow-soft">
          <p className="text-sm text-neutral-slate">
            Tidak ditemukan data yang cocok dengan pencarian.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="overflow-hidden rounded-card bg-white shadow-soft transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-square bg-primary-teal/10">
                {t.fotoUrl ? (
                  <Image
                    src={t.fotoUrl}
                    alt={t.nama}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary-teal-deep">
                    <User className="h-16 w-16" strokeWidth={1.2} />
                  </div>
                )}
                <span
                  className={cn(
                    "absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-soft",
                    STATUS_BADGE[t.statusKepegawaian]
                  )}
                >
                  <BadgeCheck className="h-3 w-3" />
                  {STATUS_LABEL[t.statusKepegawaian]}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold leading-snug text-neutral-espresso line-clamp-2">
                  {t.nama}
                </h3>
                <p className="mt-1 text-xs font-medium text-primary-teal-deep">
                  {t.jabatan}
                </p>
                <div className="mt-2.5 space-y-1 border-t border-neutral-espresso/10 pt-2.5">
                  {t.nip && (
                    <p className="text-[11px] text-neutral-slate">
                      NIP: {t.nip}
                    </p>
                  )}
                  {t.nuptk && (
                    <p className="text-[11px] text-neutral-slate">
                      NUPTK: {t.nuptk}
                    </p>
                  )}
                  {!t.nip && !t.nuptk && (
                    <p className="text-[11px] text-neutral-slate">-</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryBadge({
  icon: Icon,
  label,
  value,
  className,
  iconClassName,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-button px-3 py-2", className)}>
      <span className={cn("flex h-7 w-7 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep", iconClassName)}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-extrabold text-neutral-espresso">{value}</p>
        <p className="text-[10px] text-neutral-slate">{label}</p>
      </div>
    </div>
  );
}
