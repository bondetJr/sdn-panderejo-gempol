import Link from "next/link";
import {
  Target,
  BookMarked,
  Network,
  MessageCircleHeart,
  Building2,
  Award,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getSchoolProfile } from "@/lib/school";

const MENU_PROFIL = [
  {
    href: "/profil/visi-misi",
    label: "Visi & Misi",
    desc: "Arah dan tujuan pendidikan sekolah",
    icon: Target,
  },
  {
    href: "/profil/sejarah",
    label: "Sejarah",
    desc: "Perjalanan berdirinya sekolah",
    icon: BookMarked,
  },
  {
    href: "/profil/struktur-organisasi",
    label: "Struktur Organisasi",
    desc: "Susunan pengelola sekolah",
    icon: Network,
  },
  {
    href: "/profil/sambutan-kepala-sekolah",
    label: "Sambutan Kepala Sekolah",
    desc: "Kata sambutan dari pimpinan sekolah",
    icon: MessageCircleHeart,
  },
  {
    href: "/profil/fasilitas",
    label: "Fasilitas",
    desc: "Sarana & prasarana penunjang belajar",
    icon: Building2,
  },
  {
    href: "/profil/akreditasi-prestasi",
    label: "Akreditasi & Prestasi",
    desc: "Pencapaian dan status akreditasi sekolah",
    icon: Award,
  },
];

export default async function ProfilPage() {
  const school = await getSchoolProfile();

  return (
    <>
      <PageHeader
        title="Profil Sekolah"
        description={`Mengenal lebih dekat ${school.nama} — identitas, visi misi, hingga fasilitas yang kami miliki.`}
        breadcrumbs={[{ label: "Profil Sekolah" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MENU_PROFIL.map((menu) => (
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
