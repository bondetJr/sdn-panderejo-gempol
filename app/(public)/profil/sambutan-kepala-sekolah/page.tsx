import Image from "next/image";
import { Quote, User } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getKepalaSekolah } from "@/lib/profil-data";

export default async function SambutanKepalaSekolahPage() {
  const kepsek = await getKepalaSekolah();
  const paragraphs = kepsek.sambutanText
    ? kepsek.sambutanText.split("\n").filter(Boolean)
    : [];

  return (
    <>
      <PageHeader
        title="Sambutan Kepala Sekolah"
        breadcrumbs={[
          { label: "Profil Sekolah", href: "/profil" },
          { label: "Sambutan Kepala Sekolah" },
        ]}
      />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-card bg-white p-6 shadow-soft sm:p-10">
          {/* Identitas Kepala Sekolah */}
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-primary-teal/10 ring-4 ring-primary-teal/10">
              {kepsek.fotoUrl ? (
                <Image
                  src={kepsek.fotoUrl}
                  alt={kepsek.nama}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary-teal-deep">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-extrabold text-neutral-espresso">
                {kepsek.nama}
              </p>
              <p className="text-sm text-neutral-slate">Kepala Sekolah</p>
              {kepsek.nip && (
                <p className="mt-0.5 text-xs text-neutral-slate">
                  NIP. {kepsek.nip}
                </p>
              )}
            </div>
          </div>

          <div className="my-8 h-px bg-neutral-espresso/10" />

          {/* Isi Sambutan */}
          <Quote className="h-8 w-8 text-primary-teal/30" />
          <div className="mt-3 space-y-4">
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                className="text-justify text-sm leading-relaxed text-neutral-espresso/90 sm:text-base"
              >
                {p}
              </p>
            ))}
          </div>

          <p className="mt-8 text-right text-sm font-semibold text-neutral-espresso">
            {kepsek.nama}
            <span className="block text-xs font-normal text-neutral-slate">
              Kepala Sekolah
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
