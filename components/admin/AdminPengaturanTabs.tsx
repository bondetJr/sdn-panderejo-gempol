"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminPengaturanTabs({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Data Sekolah", href: "/admin/pengaturan/sekolah" },
    ...(isSuperAdmin
      ? [{ label: "Kelola Pengguna", href: "/admin/pengaturan/users" }]
      : []),
  ];

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {tabs.map((tab) => {
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
