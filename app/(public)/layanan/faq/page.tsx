import { PageHeader } from "@/components/layout/PageHeader";
import { FaqAccordion } from "@/components/kontak/FaqAccordion";
import { getFaqList } from "@/lib/kontak-data";

export const metadata = {
  title: "Pertanyaan Ayah & Ibu",
  description: "Kumpulan pertanyaan yang sering ditanyakan Ayah & Ibu seputar layanan SDN Panderejo Gempol",
};

export default async function FaqPage() {
  const faq = await getFaqList();

  return (
    <>
      <PageHeader
        title="Pertanyaan Ayah & Ibu"
        description="Kumpulan jawaban atas pertanyaan yang paling sering ditanyakan Ayah & Ibu wali murid."
        breadcrumbs={[
          { label: "Layanan", href: "/layanan" },
          { label: "Pertanyaan Ayah & Ibu" },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {faq.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-neutral-slate">Belum ada pertanyaan yang tersedia.</p>
          </div>
        ) : (
          <FaqAccordion faq={faq} />
        )}
      </section>
    </>
  );
}
