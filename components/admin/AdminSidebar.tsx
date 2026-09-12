"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, X } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav-config";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  role,
  mobileOpen,
  onClose,
}: {
  role: string;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const visibleNav = ADMIN_NAV.filter(
    (item) => !item.restrictedFrom?.includes(role as never)
  );

  const content = (
    <div className="flex h-full flex-col bg-neutral-graphite text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-teal text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold leading-tight">SDN Panderejo</p>
            <p className="text-[10px] text-white/50">Dashboard Admin</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden"
          aria-label="Tutup menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {visibleNav.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-button px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-teal text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <Link
          href="/"
          className="text-xs text-white/50 hover:text-white/80"
        >
          ← Kembali ke Website Publik
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">{content}</div>
      </aside>

      {/* Mobile: drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-72">{content}</div>
        </div>
      )}
    </>
  );
}
