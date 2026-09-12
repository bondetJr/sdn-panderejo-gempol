import Link from "next/link";
import { ArrowRight, MapPin, GraduationCap } from "lucide-react";
import type { SchoolProfile } from "@/lib/school";

export function Hero({ school }: { school: SchoolProfile }) {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      {/* Dekorasi halus, ukuran lebih kecil dari versi sebelumnya */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          {/* Teks */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
              <MapPin className="h-3 w-3" />
              {school.desa}, {school.kecamatan}, {school.kabupaten}
            </span>

            <h1 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
              {school.nama}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
              {school.tagline}
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/ppdb/daftar"
                className="inline-flex items-center justify-center gap-2 rounded-button bg-white px-5 py-2.5 text-sm font-bold text-primary-teal-deep shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Daftar PPDB Online
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/profil/visi-misi"
                className="inline-flex items-center justify-center gap-2 rounded-button border border-white/40 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Kenali Sekolah Kami
              </Link>
            </div>
          </div>

          {/* Ilustrasi — lebih kecil, hanya tampil di layar besar */}
          <div className="hidden lg:flex">
            <div className="flex h-32 w-32 items-center justify-center rounded-hero bg-white/10">
              <GraduationCap className="h-14 w-14 text-white" strokeWidth={1.3} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
