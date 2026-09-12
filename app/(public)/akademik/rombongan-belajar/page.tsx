import { PageHeader } from "@/components/layout/PageHeader";
import { RombonganBelajarExplorer } from "@/components/akademik/RombonganBelajarExplorer";
import { getRombonganBelajarPublic } from "@/lib/academic-data";

export const metadata = {
  title: "Rombongan Belajar",
};

export default async function RombonganBelajarPage() {
  const classRooms = await getRombonganBelajarPublic();

  return (
    <>
      <PageHeader
        title="Rombongan Belajar"
        description="Pilih tingkat kelas, lalu klik salah satu rombel untuk melihat ringkasan dan daftar siswa aktif."
        breadcrumbs={[
          { label: "Akademik", href: "/akademik" },
          { label: "Rombongan Belajar" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <RombonganBelajarExplorer classRooms={classRooms} />
      </section>
    </>
  );
}
