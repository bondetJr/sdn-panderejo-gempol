import { PageHeader } from "@/components/layout/PageHeader";
import { EkstrakurikulerGrid } from "@/components/akademik/EkstrakurikulerGrid";
import { getExtracurriculars } from "@/lib/academic-data";

export const metadata = {
  title: "Ekstrakurikuler",
};

export default async function EkstrakurikulerPage() {
  const ekskul = await getExtracurriculars();

  return (
    <>
      <PageHeader
        title="Ekstrakurikuler"
        description="Kegiatan pengembangan bakat dan minat siswa di luar jam pelajaran. Klik salah satu kegiatan untuk melihat detail dan foto kegiatannya."
        breadcrumbs={[
          { label: "Akademik", href: "/akademik" },
          { label: "Ekstrakurikuler" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {ekskul.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-neutral-slate">
              Belum ada data ekstrakurikuler.
            </p>
          </div>
        ) : (
          <EkstrakurikulerGrid ekskul={ekskul} />
        )}
      </section>
    </>
  );
}
