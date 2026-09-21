"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDown, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { NAV_CONFIG } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import { SchoolLogo } from "@/components/layout/SchoolLogo";
import type { SchoolProfile } from "@/lib/school";

export function Header({ school }: { school: SchoolProfile }) {
  const { status } = useSession();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  // Portal hanya boleh dipakai setelah mount (document belum tersedia saat SSR)
  useEffect(() => setMounted(true), []);
  const isAuthenticated = mounted && status === "authenticated";

  // Tutup mega-menu & mobile drawer setiap pindah halaman
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
    setMobileSubOpen(null);
  }, [pathname]);

  // Tutup dropdown saat klik di luar header
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-primary-teal-deep/10 bg-base-cloud/95 backdrop-blur supports-backdrop-filter:bg-base-cloud/80"
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo & Nama Sekolah */}
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
          <SchoolLogo logoUrl={school.logoUrl} alt={school.nama} size={44} className="shadow-soft" />
          <span className="min-w-0 flex flex-col">
          <span className="max-w-full truncate text-xs font-bold leading-tight text-primary-teal-deep sm:max-w-none sm:text-sm">
              {school.nama}
            </span>
            <span className="hidden text-xs text-neutral-slate sm:block">
              {school.npsn} · {school.kecamatan}, {school.kabupaten}
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          {NAV_CONFIG.map((group) => {
            const isActive =
              group.href === "/"
                ? pathname === "/"
                : group.href === "/layanan"
                  ? pathname.startsWith("/layanan")
                  : pathname.startsWith(group.href ?? "#never");
            const hasDropdown = !!group.items?.length;

            return (
              <div key={group.label} className="relative">
                {hasDropdown ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup(openGroup === group.label ? null : group.label)
                    }
                    onMouseEnter={() => setOpenGroup(group.label)}
                    className={cn(
                      "flex items-center gap-1 rounded-button px-3 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "text-primary-teal-deep"
                        : "text-neutral-espresso/80 hover:text-primary-teal-deep"
                    )}
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        openGroup === group.label && "rotate-180"
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={group.href!}
                    className={cn(
                      "flex items-center gap-1 rounded-button px-3 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "text-primary-teal-deep"
                        : "text-neutral-espresso/80 hover:text-primary-teal-deep"
                    )}
                  >
                    {group.label}
                  </Link>
                )}

                {/* Dropdown panel */}
                {hasDropdown && openGroup === group.label && (
                  <div
                    onMouseLeave={() => setOpenGroup(null)}
                    className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-card border border-neutral-espresso/5 bg-white p-2 shadow-soft"
                  >
                    {group.items!.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-sm text-neutral-espresso/80 hover:bg-primary-teal/10 hover:text-primary-teal-deep"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sign In (desktop) + Hamburger (mobile) */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={isAuthenticated ? "/admin" : "/login"}
            className="hidden items-center gap-2 rounded-button border-2 border-primary-teal px-4 py-2 text-sm font-semibold text-primary-teal-deep transition-colors hover:bg-primary-teal hover:text-white lg:flex"
          >
            {isAuthenticated ? (
              <>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </Link>
          <button
            type="button"
            aria-label="Buka menu navigasi"
            onClick={() => setMobileOpen(true)}
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-button text-primary-teal-deep hover:bg-primary-teal/10 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer — dirender via portal ke document.body supaya TIDAK
          terjebak di dalam containing block yang dibuat backdrop-blur pada
          <header> (sticky + backdrop-filter membuat containing block baru,
          sehingga "fixed" di dalamnya jadi relatif ke header, bukan viewport). */}
      {mounted &&
        mobileOpen &&
        createPortal(
          <div className="fixed inset-0 z-100 lg:hidden">
            <div
              className="absolute inset-0 bg-neutral-graphite/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-base-cloud shadow-soft">
              <div className="flex items-center justify-between border-b border-neutral-espresso/10 px-4 py-4">
                <span className="flex items-center gap-2.5">
                  <SchoolLogo logoUrl={school.logoUrl} alt={school.nama} size={32} />
                  <span className="text-sm font-bold text-primary-teal-deep">
                    {school.nama}
                  </span>
                </span>
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-button hover:bg-primary-teal/10"
              >
                <X className="h-5 w-5 text-neutral-espresso" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {NAV_CONFIG.map((group) => {
                const hasDropdown = !!group.items?.length;
                return (
                  <div key={group.label} className="mb-1">
                    <div className="flex items-center justify-between">
                      <Link
                        href={group.href ?? "#"}
                        onClick={(event) => {
                          if (hasDropdown) {
                            event.preventDefault();
                            setMobileSubOpen(
                              mobileSubOpen === group.label ? null : group.label
                            );
                          }
                        }}
                        className="flex-1 rounded-button px-3 py-3 text-sm font-semibold text-neutral-espresso hover:bg-primary-teal/10 hover:text-primary-teal-deep"
                      >
                        {group.label}
                      </Link>
                      {hasDropdown && (
                        <button
                          type="button"
                          aria-label={`Buka sub-menu ${group.label}`}
                          onClick={() =>
                            setMobileSubOpen(
                              mobileSubOpen === group.label ? null : group.label
                            )
                          }
                          className="flex h-11 w-11 items-center justify-center"
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-neutral-slate transition-transform",
                              mobileSubOpen === group.label && "rotate-180"
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {hasDropdown && mobileSubOpen === group.label && (
                      <div className="ml-3 border-l-2 border-primary-teal/20 pl-3">
                        {group.items!.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block rounded-lg px-3 py-2 text-sm text-neutral-slate hover:text-primary-teal-deep"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-neutral-espresso/10 p-4">
              <Link
                href={isAuthenticated ? "/admin" : "/login"}
                className="flex items-center justify-center gap-2 rounded-button border-2 border-primary-teal px-4 py-3 text-sm font-semibold text-primary-teal-deep hover:bg-primary-teal hover:text-white"
              >
                {isAuthenticated ? (
                  <>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
