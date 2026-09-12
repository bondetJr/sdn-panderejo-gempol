"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Lokasi", href: "/kontak/lokasi" },
  { label: "Hubungi Kami", href: "/kontak/hubungi-kami" },
  { label: "Buku Tamu", href: "/kontak/buku-tamu" },
  { label: "FAQ", href: "/kontak/faq" },
];

export function KontakTabs() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[72px] z-40 border-b border-neutral-espresso/10 bg-base-cloud/95 backdrop-blur">
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-max gap-1 py-2">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "whitespace-nowrap rounded-button px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary-teal text-white"
                    : "text-neutral-slate hover:bg-primary-teal/10 hover:text-primary-teal-deep"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
