import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
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
              <SocialIcon href="https://www.instagram.com/spander.gempol/" label="Instagram">
                <InstagramIcon />
              </SocialIcon>
              <SocialIcon href="https://www.youtube.com/@sdnpanderejo9764" label="YouTube">
                <YouTubeIcon />
              </SocialIcon>
              <SocialIcon href="https://www.tiktok.com/@spander.id" label="TikTok">
                <TikTokIcon />
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
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary-teal"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <defs>
        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="35%" stopColor="#fa7e1e" />
          <stop offset="65%" stopColor="#d62976" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#instagram-gradient)" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.7" r="1.1" fill="white" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.9 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.8 29 29 0 0 0-.5-4.8Z"
        fill="#ff0000"
      />
      <path d="m10 15.5 5-3.5-5-3.5v7Z" fill="white" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M15.8 3c.3 2.2 1.5 3.5 3.7 3.7v3.1a8.6 8.6 0 0 1-3.7-1.1v6.6a5.7 5.7 0 1 1-5.7-5.7c.4 0 .8 0 1.2.1v3.2a2.5 2.5 0 1 0 1.3 2.2V3h3.2Z"
        fill="#25f4ee"
        transform="translate(-1 1)"
      />
      <path
        d="M15.8 3c.3 2.2 1.5 3.5 3.7 3.7v3.1a8.6 8.6 0 0 1-3.7-1.1v6.6a5.7 5.7 0 1 1-5.7-5.7c.4 0 .8 0 1.2.1v3.2a2.5 2.5 0 1 0 1.3 2.2V3h3.2Z"
        fill="#fe2c55"
        transform="translate(1 -1)"
      />
      <path
        d="M15.8 3c.3 2.2 1.5 3.5 3.7 3.7v3.1a8.6 8.6 0 0 1-3.7-1.1v6.6a5.7 5.7 0 1 1-5.7-5.7c.4 0 .8 0 1.2.1v3.2a2.5 2.5 0 1 0 1.3 2.2V3h3.2Z"
        fill="white"
      />
    </svg>
  );
}
