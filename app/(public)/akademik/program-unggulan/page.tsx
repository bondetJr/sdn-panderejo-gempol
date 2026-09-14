import Image from "next/image";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getFlagshipPrograms } from "@/lib/program-unggulan-data";

export const dynamic = "force-dynamic";

function getIcon(name: string): LucideIcon {
  return (
    (LucideIcons[name as keyof typeof LucideIcons] as LucideIcon | undefined) ??
    LucideIcons.Sparkles
  );
}

export default async function ProgramUnggulanPage() {
  const programs = await getFlagshipPrograms();

  return (
    <>
      <PageHeader
        title="Program Unggulan Sekolah"
        description="Beragam program pilihan untuk mengembangkan potensi, karakter, dan prestasi peserta didik."
        breadcrumbs={[
          { label: "Akademik", href: "/akademik" },
          { label: "Program Unggulan" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((program, index) => {
            const Icon = getIcon(program.icon);

            return (
              <article
                key={program.id}
                className="overflow-hidden rounded-card bg-white shadow-soft transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/8] bg-primary-teal/10">
                  {program.fotoUrl ? (
                    <>
                      <Image src={program.fotoUrl} alt={program.nama} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
                      {program.realisasiText && (
                        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-neutral-graphite/75 px-3 py-2 text-xs font-semibold leading-relaxed text-white">
                          {program.realisasiText}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon className="h-14 w-14 text-primary-teal-deep/25" strokeWidth={1.5} />
                    </div>
                  )}
                  <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm font-extrabold text-primary-teal-deep shadow-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-teal/10 text-primary-teal-deep">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-extrabold text-neutral-espresso">
                        {program.nama}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-primary-teal-deep">
                        {program.deskripsiSingkat}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-justify text-sm leading-7 text-neutral-espresso/75">
                    {program.deskripsiLengkap}
                  </p>
                  {program.subImages.length > 0 && (
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {program.subImages.map((image) => (
                        <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                          <Image src={image.url} alt={`${program.nama} - kegiatan`} fill className="object-cover" sizes="200px" unoptimized />
                        </div>
                      ))}
                    </div>
                  )}
                  {(program.impactUtama || program.impactSatu || program.impactDua || program.impactTiga) && (
                    <div className="mt-5 rounded-2xl bg-primary-teal/5 p-4">
                      <h3 className="text-xs font-extrabold uppercase tracking-wide text-primary-teal-deep">
                        Impact ke Siswa
                      </h3>
                      {program.impactUtama && (
                        <p className="mt-2 text-sm font-bold text-neutral-espresso">{program.impactUtama}</p>
                      )}
                      <ul className="mt-2 space-y-1 text-xs leading-relaxed text-neutral-espresso/75">
                        {[program.impactSatu, program.impactDua, program.impactTiga]
                          .filter((impact): impact is string => Boolean(impact))
                          .map((impact) => <li key={impact}>• {impact}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
