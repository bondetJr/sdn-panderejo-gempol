import Image from "next/image";
import { User } from "lucide-react";
import type { OrgPerson } from "@/lib/struktur-data";

function PersonCard({ person, size = "md" }: { person: OrgPerson; size?: "md" | "sm" }) {
  const dim = size === "md" ? "h-16 w-16" : "h-12 w-12";
  return (
    <div className="flex flex-col items-center gap-2 rounded-card bg-white p-4 text-center shadow-soft">
      <div className={`relative ${dim} shrink-0 overflow-hidden rounded-full bg-primary-teal/10`}>
        {person.fotoUrl ? (
          <Image src={person.fotoUrl} alt={person.nama} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary-teal-deep">
            <User className={size === "md" ? "h-7 w-7" : "h-5 w-5"} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold leading-snug text-neutral-espresso sm:text-sm">
          {person.nama}
        </p>
        <p className="mt-0.5 text-[11px] text-primary-teal-deep">{person.jabatan}</p>
      </div>
    </div>
  );
}

/** Garis penghubung vertikal antar level, dekorasi sederhana. */
function Connector() {
  return <div className="mx-auto h-6 w-px bg-neutral-espresso/15" />;
}

export function OrgChart({
  kepalaSekolah,
  komite,
  guru,
  tendik,
}: {
  kepalaSekolah: OrgPerson | null;
  komite: OrgPerson[];
  guru: OrgPerson[];
  tendik: OrgPerson[];
}) {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Level 1: Kepala Sekolah */}
      <div className="flex flex-col items-center">
        <span className="mb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-slate">
                 </span>
        {kepalaSekolah ? (
          <div className="w-56">
            <PersonCard person={kepalaSekolah} />
          </div>
        ) : (
          <p className="text-sm text-neutral-slate">Data Kepala Sekolah belum diisi.</p>
        )}
      </div>

      <Connector />

      {/* Level 2: Komite Sekolah */}
      <div className="flex flex-col items-center">
        <span className="mb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-slate">
          Komite Sekolah
        </span>
        {komite.length === 0 ? (
          <p className="text-sm text-neutral-slate">Data Komite Sekolah belum diisi.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {komite.map((k) => (
              <div key={k.id} className="w-44">
                <PersonCard person={k} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      <Connector />

      {/* Level 3: Guru & Tendik (terpisah) */}
      <div>
        <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wide text-neutral-slate">
          Guru & Tenaga Kependidikan
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 text-center text-sm font-bold text-primary-teal-deep">
              Tenaga Pendidik
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {guru.map((g) => (
                <PersonCard key={g.id} person={g} size="sm" />
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-center text-sm font-bold text-primary-teal-deep">
              Tenaga Kependidikan
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tendik.map((t) => (
                <PersonCard key={t.id} person={t} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
