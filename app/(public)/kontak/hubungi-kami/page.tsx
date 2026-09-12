import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/kontak/ContactForm";

export const metadata = {
  title: "Hubungi Kami",
};

export default function HubungiKamiPage() {
  return (
    <>
      <PageHeader
        title="Hubungi Kami"
        description="Sampaikan pertanyaan, saran, atau pengaduan Bapak/Ibu kepada kami."
        breadcrumbs={[
          { label: "Kontak", href: "/kontak/lokasi" },
          { label: "Hubungi Kami" },
        ]}
      />

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactForm />
      </section>
    </>
  );
}
