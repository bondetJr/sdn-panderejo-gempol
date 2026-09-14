import Link from "next/link";
import {
  BookOpenText,
  CalendarRange,
  Clock3,
  Users2,
  Palette,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

const MENU_AKADEMIK = [
  {
    href: "/akademik/kurikulum",
    label: "Kurikulum",
    desc: "Kurikulum Merdeka yang diterapkan sekolah",
    icon: BookOpenText,
  },
  {
    href: "/akademik/program-unggulan",
    label: "Program Unggulan",
    desc: "Program pilihan untuk mengembangkan potensi siswa",
    icon: Sparkles,
  },
  {
    href: "/akademik/kalender-akademik",
    label: "Kalender Akademik",
    desc: "Agenda dan jadwal kegiatan tahun ajaran",
    icon: CalendarRange,
  },
  {
    href: "/akademik/jadwal-pelajaran",
    label: "Jadwal Pelajaran",
    desc: "Jadwal mata pelajaran per tingkat kelas",
    icon: Clock3,
  },
  {
    href: "/akademik/rombongan-belajar",
    label: "Rombongan Belajar",
    desc: "Daftar kelas 1-6 beserta wali kelas & siswa",
    icon: Users2,
  },
  {
    href: "/akademik/ekstrakurikuler",
    label: "Ekstrakurikuler",
    desc: "Kegiatan pengembangan bakat & minat siswa",
    icon: Palette,
  },
];

export default function AkademikPage() {
  return (
    <>
      <PageHeader
        title="Akademik & Kurikulum"
        description="Informasi seputar kurikulum, kalender akademik, jadwal, dan pembagian kelas di sekolah kami."
        breadcrumbs={[{ label: "Akademik" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MENU_AKADEMIK.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group flex flex-col rounded-card bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-teal/10 text-primary-teal-deep transition-colors group-hover:bg-primary-teal group-hover:text-white">
                <menu.icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-base font-bold text-neutral-espresso">
                {menu.label}
              </h2>
              <p className="mt-1.5 text-sm text-neutral-slate">{menu.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-teal-deep">
                Selengkapnya
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
