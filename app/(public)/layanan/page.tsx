import { PageHeader } from "@/components/layout/PageHeader";
import { LayananGrid } from "@/components/layanan/LayananGrid";
import { getServiceStandards } from "@/lib/layanan-data";

export const metadata = {
  title: "Standar Pelayanan",
  description:
    "Standar pelayanan SD Negeri Panderejo Gempol: persyaratan, mekanisme, waktu, biaya, produk layanan, dan kanal pengaduan.",
};

export default async function LayananPage() {
  const layanan = await getServiceStandards();

  return (
    <>
      <PageHeader
        title="Standar Pelayanan"
        description="Informasi resmi setiap layanan sekolah — mulai dari persyaratan, alur, waktu penyelesaian, sampai kanal pengaduan. Klik kartu untuk melihat detail lengkapnya."
        breadcrumbs={[{ label: "Standar Pelayanan" }]}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {layanan.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-neutral-slate">
              Belum ada standar pelayanan yang dipublikasikan.
            </p>
          </div>
        ) : (
          <LayananGrid items={layanan} />
        )}
      </section>
    </>
  );
}
