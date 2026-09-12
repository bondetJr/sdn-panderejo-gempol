"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown, LogOut, Menu, Search, User } from "lucide-react";
import { ROLE_LABEL } from "@/lib/admin-nav-config";
import { cn } from "@/lib/utils";

export function AdminTopbar({
  userName,
  role,
  notifCount,
  onMenuClick,
}: {
  userName: string;
  role: string;
  notifCount: number;
  onMenuClick: () => void;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-neutral-espresso/10 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-button text-neutral-espresso hover:bg-primary-teal/10 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-slate" />
          <input
            type="text"
            placeholder="Cari data..."
            className="w-64 rounded-button border border-neutral-espresso/10 bg-neutral-espresso/[0.03] py-2 pl-10 pr-4 text-sm focus:border-primary-teal focus:outline-none focus:ring-2 focus:ring-primary-teal/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-espresso hover:bg-primary-teal/10"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          {notifCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-button px-2 py-1.5 hover:bg-primary-teal/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
              <User className="h-4 w-4" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-bold text-neutral-espresso">
                {userName}
              </span>
              <span className="block text-[11px] text-neutral-slate">
                {ROLE_LABEL[role] ?? role}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-neutral-slate transition-transform",
                userMenuOpen && "rotate-180"
              )}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-card border border-neutral-espresso/10 bg-white p-1.5 shadow-soft">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
