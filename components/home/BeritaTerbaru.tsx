import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import { formatTanggalId } from "@/lib/utils";

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
};

export function BeritaTerbaru({ berita }: { berita: NewsItem[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-teal">
            Terkini
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-neutral-espresso sm:text-3xl">
            Berita & Kegiatan Terbaru
          </h2>
        </div>
        <Link
          href="/informasi/berita"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-teal-deep hover:underline"
        >
          Semua Berita
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {berita.map((item) => (
          <Link
            key={item.id}
            href={`/informasi/berita/${item.slug}`}
            className="group overflow-hidden rounded-card bg-white shadow-soft transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              {item.coverImageUrl ? (
                <Image
                  src={item.coverImageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-primary-teal/10" />
              )}
            </div>
            <div className="p-5">
              {item.publishedAt && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-slate">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatTanggalId(item.publishedAt)}
                </p>
              )}
              <h3 className="mt-2 text-base font-bold leading-snug text-neutral-espresso line-clamp-2 group-hover:text-primary-teal-deep">
                {item.title}
              </h3>
              {item.excerpt && (
                <p className="mt-2 text-sm leading-relaxed text-neutral-slate line-clamp-2">
                  {item.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
