import { PageHeader } from "@/components/layout/PageHeader";
import { FacilityCard } from "@/components/facility/FacilityCard";
import { getFasilitasAll } from "@/lib/profil-data";

export const metadata = {
  title: "Fasilitas Sekolah",
};

export default async function FasilitasPage() {
  const fasilitas = await getFasilitasAll();

  return (
    <>
      <PageHeader
        title="Fasilitas Sekolah"
        description="Sarana dan prasarana yang kami sediakan untuk mendukung proses belajar-mengajar yang nyaman dan berkualitas."
        breadcrumbs={[
          { label: "Profil Sekolah", href: "/profil" },
          { label: "Fasilitas" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {fasilitas.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-neutral-slate">
              Data fasilitas belum tersedia. Admin dapat menambahkan data
              fasilitas melalui Dashboard Admin &gt; Profil Manager.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fasilitas.map((f) => (
              <FacilityCard key={f.id} facility={f} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
