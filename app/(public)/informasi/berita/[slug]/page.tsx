import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getNewsBySlug } from "@/lib/informasi-data";
import { formatTanggalId } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return {
      title: "Berita Tidak Ditemukan",
      description: "Berita yang Anda cari tidak tersedia di SDN Panderejo Gempol.",
    };
  }

  return {
    title: news.title,
    description: news.excerpt || news.content.slice(0, 160),
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) notFound();

  const paragraphs = news.content.split("\n").filter(Boolean);

  return (
    <>
      <PageHeader
        title={news.title}
        breadcrumbs={[
          { label: "Informasi", href: "/informasi/berita" },
          { label: "Berita", href: "/informasi/berita" },
          { label: news.title },
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {news.publishedAt && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-slate">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatTanggalId(news.publishedAt)}
          </p>
        )}

        {news.coverImageUrl && (
          <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-card shadow-soft">
            <Image
              src={news.coverImageUrl}
              alt={news.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <div className="mt-6 space-y-4">
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className="text-sm leading-relaxed text-neutral-espresso/90 sm:text-base"
            >
              {p}
            </p>
          ))}
        </div>
      </article>
    </>
  );
}
