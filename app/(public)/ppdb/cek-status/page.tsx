import { PageHeader } from "@/components/layout/PageHeader";
import { CekStatusForm } from "@/components/ppdb/CekStatusForm";

export const metadata = {
  title: "Cek Status PPDB",
};

export default function CekStatusPage() {
  return (
    <>
      <PageHeader
        title="Cek Status PPDB"
        description="Masukkan Nomor Pendaftaran dan NIK untuk melihat status pendaftaran Anda."
        breadcrumbs={[
          { label: "PPDB", href: "/ppdb/informasi" },
          { label: "Cek Status" },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <CekStatusForm />
      </section>
    </>
  );
}
