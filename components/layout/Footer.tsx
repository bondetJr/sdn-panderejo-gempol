import Link from "next/link";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { FOOTER_QUICK_LINKS } from "@/lib/nav-config";
import { SchoolLogo } from "@/components/layout/SchoolLogo";
import type { SchoolProfile } from "@/lib/school";

export function Footer({ school }: { school: SchoolProfile }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-graphite text-white/90">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Identitas + Sosial */}
          <div>
            <div className="flex items-center gap-2.5">
              <SchoolLogo logoUrl={school.logoUrl} alt={school.nama} size={38} />
              <div>
                <p className="text-sm font-bold leading-tight text-white">
                  {school.nama}
                </p>
                <p className="text-xs text-white/50">NPSN {school.npsn}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <SocialIcon href="#" label="Facebook">
                <Facebook className="h-3.5 w-3.5" />
              </SocialIcon>
              <SocialIcon href="#" label="Instagram">
                <Instagram className="h-3.5 w-3.5" />
              </SocialIcon>
              <SocialIcon href="#" label="YouTube">
                <Youtube className="h-3.5 w-3.5" />
              </SocialIcon>
            </div>
          </div>

          {/* Link Cepat */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/70">
              Link Cepat
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/60 transition-colors hover:text-accent-lime"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak — dipadatkan */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/70">
              Kontak
            </h3>
            <ul className="space-y-2 text-xs text-white/60">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-teal-light" />
                <span>{school.alamat}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary-teal-light" />
                <span>{school.telepon}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary-teal-light" />
                <span>{school.email}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1.5 px-4 py-4 text-[11px] text-white/40 sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {year} {school.nama}. Seluruh hak cipta dilindungi.</p>
          <p>Tahun Ajaran {school.tahunAjaranAktif}</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary-teal"
    >
      {children}
    </Link>
  );
}
