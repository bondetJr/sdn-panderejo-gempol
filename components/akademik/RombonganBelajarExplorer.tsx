"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Users2, UserRound, ChevronRight, Venus, Mars, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassRoomAggregate } from "@/lib/academic-data";

export function RombonganBelajarExplorer({
  classRooms,
}: {
  classRooms: ClassRoomAggregate[];
}) {
  const [tingkat, setTingkat] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Agregat per tingkat (dihitung dari semua rombel di tingkat itu)
  const tingkatSummary = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map((t) => {
      const rombelDiTingkatIni = classRooms.filter((c) => c.tingkat === t);
      return {
        tingkat: t,
        jumlahRombel: rombelDiTingkatIni.length,
        jumlahSiswa: rombelDiTingkatIni.reduce((sum, c) => sum + c.jumlahSiswa, 0),
        waliKelasFotoUrls: rombelDiTingkatIni
          .map((c) => c.waliKelasFotoUrl)
          .filter((fotoUrl): fotoUrl is string => Boolean(fotoUrl)),
      };
    });
  }, [classRooms]);

  const studentSummary = useMemo(
    () => ({
      total: classRooms.reduce((sum, classroom) => sum + classroom.jumlahSiswa, 0),
      lakiLaki: classRooms.reduce(
        (sum, classroom) => sum + classroom.jumlahLakiLaki,
        0
      ),
      perempuan: classRooms.reduce(
        (sum, classroom) => sum + classroom.jumlahPerempuan,
        0
      ),
    }),
    [classRooms]
  );

  const rombelTingkatIni = useMemo(
    () => classRooms.filter((c) => c.tingkat === tingkat),
    [classRooms, tingkat]
  );

  const selected = useMemo(
    () => classRooms.find((c) => c.id === selectedId) ?? null,
    [classRooms, selectedId]
  );

  function handleSelectTingkat(t: number) {
    const rombel = classRooms.filter((c) => c.tingkat === t);
    setTingkat(t);
    setSelectedId(rombel.length === 1 ? rombel[0].id : null);
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-lg font-extrabold text-neutral-espresso">
          Statistik Jumlah Siswa
        </h2>
        <p className="mt-1 text-xs text-neutral-slate">
          Rekapitulasi siswa aktif berdasarkan seluruh rombongan belajar.
        </p>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-card bg-white p-4 shadow-soft">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
            <Users2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-neutral-espresso">
              {studentSummary.total}
            </p>
            <p className="text-xs text-neutral-slate">Jumlah seluruh siswa</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-card bg-sky-50 p-4 shadow-soft">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <Mars className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-neutral-espresso">
              {studentSummary.lakiLaki}
            </p>
            <p className="text-xs text-neutral-slate">Siswa laki-laki</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-card bg-rose-50 p-4 shadow-soft">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <Venus className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-neutral-espresso">
              {studentSummary.perempuan}
            </p>
            <p className="text-xs text-neutral-slate">Siswa perempuan</p>
          </div>
        </div>
      </div>

      {/* Step 1: Card 6 Tingkat — langsung tampil */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tingkatSummary.map((t) => (
          <button
            key={t.tingkat}
            type="button"
            onClick={() => handleSelectTingkat(t.tingkat)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-card border-2 p-4 text-center transition-all",
              tingkat === t.tingkat
                ? "border-primary-teal bg-primary-teal/5 shadow-soft"
                : "border-transparent bg-white shadow-soft hover:-translate-y-0.5"
            )}
          >
            {t.waliKelasFotoUrls.length > 0 ? (
              <div className="flex -space-x-2">
                {t.waliKelasFotoUrls.slice(0, 3).map((fotoUrl, index) => (
                  <Image
                    key={`${fotoUrl}-${index}`}
                    src={fotoUrl}
                    alt={`Wali kelas tingkat ${t.tingkat}`}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    unoptimized
                  />
                ))}
              </div>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                <GraduationCap className="h-5 w-5" />
              </span>
            )}
            <div>
              <p className="text-sm font-extrabold text-neutral-espresso">
                Kelas {t.tingkat}
              </p>
              <p className="text-[11px] text-neutral-slate">
                {t.jumlahRombel} rombel · {t.jumlahSiswa} siswa
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Step 2: Card Rombel (A/B/C) untuk tingkat terpilih */}
      {tingkat !== null && rombelTingkatIni.length > 1 && (
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold text-neutral-slate">
            Rombel di Kelas {tingkat}:
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {rombelTingkatIni.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-card border-2 p-4 text-left transition-all",
                  selectedId === c.id
                    ? "border-primary-teal bg-primary-teal/5 shadow-soft"
                    : "border-transparent bg-white shadow-soft hover:-translate-y-0.5"
                )}
              >
                <div className="flex w-full items-center gap-3">
                  {c.waliKelasFotoUrl ? (
                    <Image
                      src={c.waliKelasFotoUrl}
                      alt={c.waliKelasNama ? `Wali kelas ${c.waliKelasNama}` : "Wali kelas"}
                      width={42}
                      height={42}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                      <Users2 className="h-4 w-4" />
                    </span>
                  )}
                  <div className="min-w-0">
                  <p className="text-sm font-extrabold text-neutral-espresso">
                    Kelas {c.nama}
                  </p>
                  <p className="text-xs text-neutral-slate">
                    {c.jumlahSiswa} siswa
                  </p>
                  {c.waliKelasNama && (
                    <p className="mt-0.5 text-[11px] text-neutral-slate">
                      {c.waliKelasNama}
                    </p>
                  )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Panel Ringkasan Rombel (AGREGAT SAJA — tanpa nama/NISN individual) */}
      {selected && (
        <div className="mt-6 overflow-hidden rounded-card bg-white shadow-soft">
          <div className="flex flex-col gap-1 border-b border-neutral-espresso/10 bg-primary-teal-deep px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-white sm:text-base">
                Ringkasan Kelas {selected.nama}
              </h3>
              {selected.waliKelasNama && (
                <p className="text-xs text-white/70">
                  Wali Kelas: {selected.waliKelasNama}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-primary-teal/5 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold text-neutral-espresso">
                  {selected.jumlahSiswa}
                </p>
                <p className="text-xs text-neutral-slate">Total Siswa</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <Mars className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold text-neutral-espresso">
                  {selected.jumlahLakiLaki}
                </p>
                <p className="text-xs text-neutral-slate">Laki-laki</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <Venus className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold text-neutral-espresso">
                  {selected.jumlahPerempuan}
                </p>
                <p className="text-xs text-neutral-slate">Perempuan</p>
              </div>
            </div>
          </div>

          <p className="border-t border-neutral-espresso/10 px-5 py-3 text-xs text-neutral-slate">
            NIK siswa tidak pernah ditampilkan di halaman publik demi keamanan
            data. Data lengkap (termasuk NIK) hanya dapat diakses melalui
            Dashboard Admin/Guru setelah login.
          </p>

          {/* Tabel Siswa Aktif */}
          {selected.students.length === 0 ? (
            <p className="border-t border-neutral-espresso/10 p-6 text-center text-sm text-neutral-slate">
              Belum ada data siswa aktif untuk kelas ini.
            </p>
          ) : (
            <div className="overflow-x-auto border-t border-neutral-espresso/10">
              <table className="w-full min-w-140 text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-espresso/10 bg-neutral-espresso/3 text-xs font-bold uppercase tracking-wide text-neutral-slate">
                    <th className="px-4 py-3 w-14">No</th>
                    <th className="px-4 py-3">No. Induk</th>
                    <th className="px-4 py-3">NISN</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3 w-28">Jenis Kelamin</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.students.map((s, idx) => (
                    <tr
                      key={s.id}
                      className="border-b border-neutral-espresso/5 last:border-0 hover:bg-primary-teal/5"
                    >
                      <td className="px-4 py-3 text-neutral-slate">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-neutral-espresso">
                        {s.nis ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-neutral-espresso">
                        {s.nisn ?? "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-espresso">
                        {s.nama}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-bold",
                            s.jenisKelamin === "L"
                              ? "bg-sky-50 text-sky-700"
                              : "bg-rose-50 text-rose-700"
                          )}
                        >
                          {s.jenisKelamin === "L"
                            ? "Laki-laki"
                            : s.jenisKelamin === "P"
                            ? "Perempuan"
                            : "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tingkat === null && (
        <p className="mt-5 flex items-center gap-1.5 text-xs text-neutral-slate">
          <ChevronRight className="h-3.5 w-3.5" />
          Klik salah satu kartu Kelas di atas untuk melihat rombelnya.
        </p>
      )}
    </div>
  );
}
