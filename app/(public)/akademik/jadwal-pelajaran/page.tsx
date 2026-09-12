import { PageHeader } from "@/components/layout/PageHeader";
import { JadwalPelajaranView } from "@/components/akademik/JadwalPelajaranView";
import { getJadwalPelajaranAll } from "@/lib/jadwal-data";

export const metadata = {
  title: "Jadwal Pelajaran",
};

export default async function JadwalPelajaranPage() {
  const jadwalData = await getJadwalPelajaranAll();

  return (
    <>
      <PageHeader
        title="Jadwal Pelajaran"
        description="Jadwal mata pelajaran mingguan untuk Kelas 1 sampai 6."
        breadcrumbs={[
          { label: "Akademik", href: "/akademik" },
          { label: "Jadwal Pelajaran" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <JadwalPelajaranView jadwalData={jadwalData} />

        <p className="mt-6 text-center text-xs text-neutral-slate">
          Jadwal dapat berubah sewaktu-waktu. Untuk jadwal terbaru, silakan
          hubungi wali kelas masing-masing.
        </p>
      </section>
    </>
  );
}
