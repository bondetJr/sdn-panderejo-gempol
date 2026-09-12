import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type Breadcrumb = { label: string; href?: string };

export function PageHeader({
  title,
  description,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  breadcrumbs: Breadcrumb[];
}) {
  return (
    <section className="bg-primary-teal-deep">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-white/60"
        >
          <Link href="/" className="flex items-center gap-1 hover:text-white">
            <Home className="h-3.5 w-3.5" />
            Beranda
          </Link>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" />
              {b.href ? (
                <Link href={b.href} className="hover:text-white">
                  {b.label}
                </Link>
              ) : (
                <span className="text-white/90">{b.label}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
