import { Network } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrgChart } from "@/components/profil/OrgChart";
import { getStrukturOrganisasi } from "@/lib/struktur-data";

export default async function StrukturOrganisasiPage() {
  const struktur = await getStrukturOrganisasi();

  return (
    <>
      <PageHeader
        title="Struktur Organisasi"
        breadcrumbs={[
          { label: "Profil Sekolah", href: "/profil" },
          { label: "Struktur Organisasi" },
        ]}
      />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-card bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
              <Network className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-extrabold text-neutral-espresso">
              Susunan Organisasi Sekolah
            </h2>
          </div>

          <OrgChart
            kepalaSekolah={struktur.kepalaSekolah}
            komite={struktur.komite}
            guru={struktur.guru}
            tendik={struktur.tendik}
          />
        </div>
      </section>
    </>
  );
}
