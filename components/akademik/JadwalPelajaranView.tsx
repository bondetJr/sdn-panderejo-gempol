"use client";

import { useState } from "react";
import { getSubject, SUBJECTS, type JadwalHarian } from "@/lib/subjects";
import { cn } from "@/lib/utils";

export function JadwalPelajaranView({
  jadwalData,
}: {
  jadwalData: Record<number, JadwalHarian[]>;
}) {
  const [tingkat, setTingkat] = useState(1);
  const jadwal = jadwalData[tingkat] ?? [];

  return (
    <div>
      {/* Selector Tingkat */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-slate">
          Kelas
        </p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTingkat(t)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-button text-sm font-bold transition-colors",
                tingkat === t
                  ? "bg-primary-teal text-white shadow-soft"
                  : "bg-white text-neutral-espresso hover:bg-primary-teal/10"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-neutral-slate">
        Menampilkan jadwal untuk siswa Kelas {tingkat} (berlaku untuk semua
        rombel paralel).
      </p>

      {/* Legenda warna mata pelajaran */}
      <div className="mt-6 flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <span
            key={s.id}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold",
              s.badgeClass
            )}
          >
            {s.singkatan}
          </span>
        ))}
      </div>

      {/* Tabel jadwal per hari */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {jadwal.map((hari) => (
          <div
            key={hari.hari}
            className="overflow-hidden rounded-card bg-white shadow-soft"
          >
            <div className="bg-primary-teal-deep px-4 py-2.5">
              <h3 className="text-sm font-bold text-white">{hari.hari}</h3>
            </div>
            <ul className="divide-y divide-neutral-espresso/5">
              {hari.slots.map((slot, idx) => {
                if (slot.subjectId === "istirahat") {
                  return (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-3 bg-neutral-espresso/3 px-4 py-2.5"
                    >
                      <span className="text-xs text-neutral-slate">
                        {slot.waktu}
                      </span>
                      <span className="text-xs font-semibold italic text-neutral-slate">
                        Istirahat
                      </span>
                    </li>
                  );
                }
                const subject = getSubject(slot.subjectId);
                return (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <span className="w-24 shrink-0 text-xs text-neutral-slate">
                      {slot.waktu}
                    </span>
                    <span
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold",
                        subject.badgeClass
                      )}
                    >
                      {subject.nama}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
