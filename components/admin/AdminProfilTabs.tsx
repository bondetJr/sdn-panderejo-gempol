"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Umum & Visi Misi", href: "/admin/profil/umum" },
  { label: "Sambutan Kepsek", href: "/admin/profil/sambutan" },
  { label: "Struktur Organisasi", href: "/admin/profil/struktur" },
  { label: "Program Unggulan", href: "/admin/profil/program" },
  { label: "Fasilitas", href: "/admin/profil/fasilitas" },
  { label: "Prestasi", href: "/admin/profil/prestasi" },
];

export function AdminProfilTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-button px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary-teal text-white shadow-soft"
                : "bg-white text-neutral-espresso hover:bg-primary-teal/10"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
