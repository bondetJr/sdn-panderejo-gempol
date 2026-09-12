import { Megaphone, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getAllAnnouncements } from "@/lib/informasi-data";
import { formatTanggalId } from "@/lib/utils";

export const metadata = {
  title: "Pengumuman",
};

export default async function PengumumanPage() {
  const pengumuman = await getAllAnnouncements();

  return (
    <>
      <PageHeader
        title="Pengumuman"
        breadcrumbs={[
          { label: "Informasi", href: "/informasi/berita" },
          { label: "Pengumuman" },
        ]}
      />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {pengumuman.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-neutral-slate">
              Belum ada pengumuman.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pengumuman.map((item) => (
              <div
                key={item.id}
                className={`rounded-card p-5 shadow-soft sm:p-6 ${
                  item.isPenting ? "bg-joy-butter/60" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      item.isPenting
                        ? "bg-joy-butter text-neutral-espresso"
                        : "bg-primary-teal/10 text-primary-teal-deep"
                    }`}
                  >
                    {item.isPenting ? (
                      <Megaphone className="h-5 w-5" />
                    ) : (
                      <Info className="h-5 w-5" />
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.isPenting && (
                        <span className="rounded-full bg-neutral-espresso px-2.5 py-0.5 text-[10px] font-bold text-white">
                          PENTING
                        </span>
                      )}
                      <p className="text-xs text-neutral-espresso/60">
                        {formatTanggalId(item.publishedAt)}
                      </p>
                    </div>
                    <h3 className="mt-1.5 text-base font-bold text-neutral-espresso">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-espresso/80">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
