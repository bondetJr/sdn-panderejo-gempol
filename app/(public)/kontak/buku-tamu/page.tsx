import { Star, User } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestimonialForm } from "@/components/kontak/TestimonialForm";
import { getApprovedTestimonials } from "@/lib/kontak-data";
import { formatTanggalId } from "@/lib/utils";

export const metadata = {
  title: "Buku Tamu",
};

export default async function BukuTamuPage() {
  const testimonials = await getApprovedTestimonials();

  return (
    <>
      <PageHeader
        title="Buku Tamu"
        description="Kesan dan pesan dari wali murid tentang SDN Panderejo Gempol."
        breadcrumbs={[
          { label: "Kontak", href: "/kontak/lokasi" },
          { label: "Buku Tamu" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <TestimonialForm />
          </div>

          <div className="space-y-4 lg:col-span-2">
            {testimonials.length === 0 ? (
              <div className="rounded-card bg-white p-10 text-center shadow-soft">
                <p className="text-sm text-neutral-slate">
                  Belum ada testimoni. Jadilah yang pertama!
                </p>
              </div>
            ) : (
              testimonials.map((t) => (
                <div key={t.id} className="rounded-card bg-white p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                        <User className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-neutral-espresso">
                          {t.nama}
                        </p>
                        {t.peran && (
                          <p className="text-xs text-neutral-slate">{t.peran}</p>
                        )}
                      </div>
                    </div>
                    {t.rating && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < t.rating!
                                ? "fill-joy-butter text-joy-butter"
                                : "text-neutral-espresso/15"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-espresso/90">
                    &ldquo;{t.pesan}&rdquo;
                  </p>
                  <p className="mt-2 text-xs text-neutral-slate">
                    {formatTanggalId(t.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
