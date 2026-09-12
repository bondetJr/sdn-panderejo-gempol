import { PageHeader } from "@/components/layout/PageHeader";
import { getAgenda } from "@/lib/academic-data";
import { AcademicCalendar } from "@/components/akademik/AcademicCalendar";

export const dynamic = "force-dynamic";

export default async function KalenderAkademikPage() {
  const agenda = await getAgenda();

  return (
    <>
      <PageHeader
        title="Kalender Akademik"
        description="Jadwal kegiatan dan agenda penting sekolah sepanjang tahun ajaran 2026/2027."
        breadcrumbs={[
          { label: "Akademik", href: "/akademik" },
          { label: "Kalender Akademik" },
        ]}
      />

      <section className="mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-primary-teal/10 px-3 py-1.5 text-primary-teal-deep">
            Agenda sekolah
          </span>
          <span className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">
            Libur nasional Indonesia
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
            Cuti bersama Indonesia
          </span>
        </div>
        <AcademicCalendar items={agenda} />
      </section>
    </>
  );
}
