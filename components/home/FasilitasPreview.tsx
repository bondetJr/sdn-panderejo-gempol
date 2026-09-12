import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FacilityCard, type FacilityCardData } from "@/components/facility/FacilityCard";

export function FasilitasPreview({
  fasilitas,
}: {
  fasilitas: FacilityCardData[];
}) {
  return (
    <section className="bg-white/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-teal">
              Sarana & Prasarana
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-neutral-espresso sm:text-3xl">
              Fasilitas Sekolah
            </h2>
          </div>
          <Link
            href="/profil/fasilitas"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-teal-deep hover:underline"
          >
            Lihat Semua Fasilitas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fasilitas.map((f) => (
            <FacilityCard key={f.id} facility={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
