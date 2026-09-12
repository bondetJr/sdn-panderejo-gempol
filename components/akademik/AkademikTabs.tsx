"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Kurikulum", href: "/akademik/kurikulum" },
  { label: "Kalender Akademik", href: "/akademik/kalender-akademik" },
  { label: "Jadwal Pelajaran", href: "/akademik/jadwal-pelajaran" },
  { label: "Rombongan Belajar", href: "/akademik/rombongan-belajar" },
  { label: "Ekstrakurikuler", href: "/akademik/ekstrakurikuler" },
];

export function AkademikTabs() {
  const pathname = usePathname();

  return (
    <div className="sticky top-18 z-40 border-b border-neutral-espresso/10 bg-base-cloud/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 lg:overflow-x-auto lg:px-8 sm:px-6">
        <div className="grid grid-cols-2 gap-1 py-2 lg:flex lg:min-w-max">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-button px-2 py-2 text-center text-xs font-semibold leading-tight transition-colors lg:whitespace-nowrap lg:px-4 lg:text-sm",
                  tab.href === "/akademik/ekstrakurikuler" && "col-span-2 lg:col-span-1",
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
