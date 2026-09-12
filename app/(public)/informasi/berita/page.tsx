import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getAllNews } from "@/lib/informasi-data";
import { formatTanggalId } from "@/lib/utils";

export const metadata = {
  title: "Berita & Kegiatan",
};

export default async function BeritaListPage() {
  const berita = await getAllNews();

  return (
    <>
      <PageHeader
        title="Berita & Kegiatan"
        breadcrumbs={[
          { label: "Informasi", href: "/informasi/berita" },
          { label: "Berita" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {berita.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-neutral-slate">Belum ada berita.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        )}
      </section>
    </>
  );
}
