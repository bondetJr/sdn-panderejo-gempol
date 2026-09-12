import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import { formatTanggalId } from "@/lib/utils";

type Pengumuman = {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
};

export function PengumumanPenting({
  pengumuman,
}: {
  pengumuman: Pengumuman[];
}) {
  if (pengumuman.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-card bg-joy-butter/60 p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-joy-butter text-neutral-espresso">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-espresso/70">
                Pengumuman Penting
              </p>
              <h3 className="mt-0.5 text-base font-bold text-neutral-espresso sm:text-lg">
                {pengumuman[0].title}
              </h3>
              <p className="mt-1 text-sm text-neutral-espresso/80 line-clamp-2">
                {pengumuman[0].content}
              </p>
              <p className="mt-1.5 text-xs text-neutral-espresso/60">
                {formatTanggalId(pengumuman[0].publishedAt)}
              </p>
            </div>
          </div>
          <Link
            href="/informasi/pengumuman"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-button bg-neutral-espresso px-5 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 sm:self-center"
          >
            Lihat Semua
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
