import Image from "next/image";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FacilityCardData = {
  id: string;
  nama: string;
  deskripsi: string;
  gambarUrl: string;
  icon?: string | null; // nama icon lucide-react, mis. "BookOpen"
};

export function FacilityCard({ facility }: { facility: FacilityCardData }) {
  const Icon: LucideIcon | undefined = facility.icon
    ? (LucideIcons[facility.icon as keyof typeof LucideIcons] as LucideIcon)
    : undefined;

  return (
    <div className="group overflow-hidden rounded-card bg-white shadow-soft transition-transform duration-300 hover:-translate-y-1">
      {/* Gambar 16:9 rounded 16px */}
      <div className="relative aspect-video overflow-hidden rounded-2xl m-2 mb-0">
        <Image
          src={facility.gambarUrl}
          alt={facility.nama}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {Icon && (
          <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary-teal-deep shadow-soft backdrop-blur">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
        )}
      </div>

      {/* Judul bold 16px espresso + deskripsi 14px slate */}
      <div className="p-5">
        <h3 className="text-base font-bold text-neutral-espresso">
          {facility.nama}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-slate line-clamp-3">
          {facility.deskripsi}
        </p>
      </div>
    </div>
  );
}
