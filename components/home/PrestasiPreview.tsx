import Link from "next/link";
import { Award, ArrowRight } from "lucide-react";
import { TINGKAT_LABEL } from "@/lib/profil-data";

type AchievementPreviewItem = {
  id: string;
  judul: string;
  tingkat: string;
  tahun: number;
  atasNamaSiswa: string | null;
};

const TINGKAT_COLOR: Record<string, string> = {
  SEKOLAH: "bg-neutral-slate/10 text-neutral-slate",
  KECAMATAN: "bg-primary-teal/10 text-primary-teal-deep",
  KABUPATEN: "bg-primary-teal-deep/10 text-primary-teal-deep",
  PROVINSI: "bg-joy-butter/60 text-neutral-espresso",
  NASIONAL: "bg-accent-lime/20 text-neutral-graphite",
};

export function PrestasiPreview({
  achievements,
}: {
  achievements: AchievementPreviewItem[];
}) {
  const previews = achievements.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-teal">
            Capaian Sekolah
          </span>
          <h2 className="mt-1.5 text-xl font-extrabold text-neutral-espresso sm:text-2xl">
            Prestasi Sekolah
          </h2>
        </div>
        <Link
          href="/profil/akreditasi-prestasi"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-teal-deep transition-colors hover:text-primary-teal sm:text-sm"
        >
          Prestasi selengkapnya
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {previews.length === 0 ? (
        <div className="mt-6 rounded-card bg-white p-6 text-center text-sm text-neutral-slate shadow-soft">
          Belum ada data prestasi.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {previews.map((achievement) => (
            <Link
              key={achievement.id}
              href="/profil/akreditasi-prestasi"
              className="group rounded-card bg-white p-4 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-joy-butter/60 text-neutral-espresso">
                  <Award className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-espresso group-hover:text-primary-teal-deep">
                    {achievement.judul}
                  </h3>
                  {achievement.atasNamaSiswa && (
                    <p className="mt-1 line-clamp-1 text-xs text-neutral-slate">
                      {achievement.atasNamaSiswa}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    TINGKAT_COLOR[achievement.tingkat] ?? TINGKAT_COLOR.SEKOLAH
                  }`}
                >
                  {TINGKAT_LABEL[achievement.tingkat] ?? achievement.tingkat}
                </span>
                <span className="text-[11px] font-semibold text-neutral-slate">
                  {achievement.tahun}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
