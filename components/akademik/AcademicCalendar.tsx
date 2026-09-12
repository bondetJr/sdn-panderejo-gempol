"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

type CalendarItem = {
  id: string;
  judul: string;
  tanggalMulai: Date;
  tanggalSelesai: Date | null;
  kategori: string | null;
};

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isHoliday(item: CalendarItem) {
  return item.kategori === "Libur Nasional" || item.kategori === "Cuti Bersama" || item.kategori === "Libur";
}

function categoryBadgeClass(category: string | null) {
  switch (category) {
    case "Libur Nasional":
    case "Libur":
      return "bg-rose-50 text-rose-700";
    case "Cuti Bersama":
      return "bg-amber-50 text-amber-700";
    case "Kegiatan":
      return "bg-sky-50 text-sky-700";
    case "Kalender Akademik":
      return "bg-primary-teal/10 text-primary-teal-deep";
    default:
      return "bg-neutral-slate/10 text-neutral-slate";
  }
}

function isOnDay(item: CalendarItem, day: Date) {
  const start = new Date(item.tanggalMulai);
  const end = item.tanggalSelesai ? new Date(item.tanggalSelesai) : start;
  const valueKey = dayKey(day);
  return dayKey(start) <= valueKey && dayKey(end) >= valueKey;
}

function isInMonth(item: CalendarItem, year: number, month: number) {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const itemStart = new Date(item.tanggalMulai);
  const itemEnd = item.tanggalSelesai ? new Date(item.tanggalSelesai) : itemStart;
  return itemStart <= monthEnd && itemEnd >= monthStart;
}

function formatDateRange(item: CalendarItem) {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  });
  const start = formatter.format(new Date(item.tanggalMulai));
  if (!item.tanggalSelesai) return start;
  return `${start} — ${formatter.format(new Date(item.tanggalSelesai))}`;
}

export function AcademicCalendar({ items }: { items: CalendarItem[] }) {
  const today = new Date();
  const todayKey = dayKey(today);
  const initial = today.getFullYear();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(initial);
  const activeSchoolItems = useMemo(
    () =>
      items
        .filter((item) => !isHoliday(item) && isInMonth(item, year, month))
        .sort(
          (a, b) =>
            new Date(a.tanggalMulai).getTime() - new Date(b.tanggalMulai).getTime()
        ),
    [items, month, year]
  );

  const semesterGroups = useMemo(() => {
    const semesterOneStart = new Date(year, 6, 1);
    const semesterOneEnd = new Date(year, 11, 31, 23, 59, 59, 999);
    const semesterTwoStart = new Date(year, 0, 1);
    const semesterTwoEnd = new Date(year, 5, 30, 23, 59, 59, 999);

    const getSemesterItems = (start: Date, end: Date) =>
      items
        .filter((item) => {
          const itemStart = new Date(item.tanggalMulai);
          const itemEnd = item.tanggalSelesai ? new Date(item.tanggalSelesai) : itemStart;
          return itemEnd >= start && itemStart <= end;
        })
        .sort(
          (a, b) =>
            new Date(a.tanggalMulai).getTime() - new Date(b.tanggalMulai).getTime()
        );

    return [
      { label: "Semester 1 (Juli - Desember)", items: getSemesterItems(semesterOneStart, semesterOneEnd) },
      { label: "Semester 2 (Januari - Juni)", items: getSemesterItems(semesterTwoStart, semesterTwoEnd) },
    ];
  }, [items, year]);

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: offset + total }, (_, index) => {
      if (index < offset) return null;
      return new Date(year, month, index - offset + 1);
    });
  }, [month, year]);

  function moveMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  }

  return (
    <div className="mb-10">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:gap-5">
        <div className="min-w-0 overflow-hidden rounded-card bg-white p-3 shadow-soft sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="h-9 w-9 shrink-0 rounded-button text-base font-bold text-primary-teal-deep hover:bg-primary-teal/10"
              aria-label="Bulan sebelumnya"
            >
              ←
            </button>
            <h2 className="text-center text-sm font-extrabold text-neutral-espresso sm:text-lg">
              {MONTHS[month]} {year}
            </h2>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="h-9 w-9 shrink-0 rounded-button text-base font-bold text-primary-teal-deep hover:bg-primary-teal/10"
              aria-label="Bulan berikutnya"
            >
              →
            </button>
          </div>

          <div className="grid min-w-0 grid-cols-7 gap-0 text-center sm:gap-1">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="py-1.5 text-[9px] font-bold text-neutral-slate sm:py-2 sm:text-[11px]">
                <span className="sm:hidden">{weekday.slice(0, 1)}</span>
                <span className="hidden sm:inline">{weekday}</span>
              </div>
            ))}
            {days.map((day, index) => {
              const dayItems = day ? items.filter((item) => isOnDay(item, day)) : [];
              const hasSchool = dayItems.some((item) => !isHoliday(item));
              const hasHoliday = dayItems.some((item) => isHoliday(item));
              const hasLeave = dayItems.some((item) => item.kategori === "Cuti Bersama");
              const isToday = !!day && dayKey(day) === todayKey;
              return (
                <div
                  key={day ? dayKey(day) : `empty-${index}`}
                  title={isToday ? "Hari ini" : undefined}
                  className={[
                    "relative flex min-h-11 items-start justify-center rounded-lg border p-1 text-center transition-colors sm:min-h-14 sm:p-1.5",
                    day ? "border-transparent" : "border-transparent",
                    isToday ? "border-primary-teal bg-primary-teal/10 shadow-sm ring-1 ring-primary-teal/20" : "",
                  ].join(" ")}
                >
                  {day && (
                    <>
                      <span
                        className={[
                          "text-xs font-semibold",
                          isToday ? "text-primary-teal-deep" : "text-neutral-espresso",
                        ].join(" ")}
                      >
                        {day.getDate()}
                      </span>
                      {isToday && (
                        <span className="absolute -top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-primary-teal sm:h-2 sm:w-2" aria-label="Hari aktif" />
                      )}
                      <div className="mt-1 flex min-h-2 justify-center gap-1">
                        {hasSchool && <span className="h-1.5 w-1.5 rounded-full bg-primary-teal sm:h-2 sm:w-2" title="Agenda sekolah" />}
                        {hasHoliday && !hasLeave && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 sm:h-2 sm:w-2" title="Libur nasional" />}
                        {hasLeave && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 sm:h-2 sm:w-2" title="Cuti bersama" />}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-x-2 gap-y-2 text-[10px] text-neutral-slate sm:gap-x-4 sm:text-[11px]">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-primary-teal" /> Agenda sekolah</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-rose-500" /> Libur nasional</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-400" /> Cuti bersama</span>
          </div>
        </div>

        <aside className="min-w-0 rounded-card bg-white p-4 shadow-soft sm:p-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary-teal-deep" />
            <h3 className="text-sm font-extrabold text-neutral-espresso">
              Agenda Sekolah
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-slate">
            {MONTHS[month]} {year}
          </p>
          {activeSchoolItems.length === 0 ? (
            <p className="mt-5 rounded-lg bg-base-cloud p-3 text-xs leading-relaxed text-neutral-slate">
              Belum ada agenda sekolah pada bulan ini.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activeSchoolItems.map((item) => (
                <li key={item.id} className="border-l-2 border-primary-teal/30 pl-3">
                  <p className="text-[11px] font-semibold text-primary-teal-deep">
                    {formatDateRange(item)}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-neutral-espresso">{item.judul}</p>
                  {item.kategori && (
                    <p className="mt-0.5 text-[11px] text-neutral-slate">{item.kategori}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {semesterGroups.map((semester) => (
          <div key={semester.label} className="min-w-0 rounded-card bg-white p-4 shadow-soft sm:p-5">
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-neutral-slate">
              {semester.label}
            </p>

            {semester.items.length === 0 ? (
              <p className="rounded-lg bg-base-cloud p-3 text-xs leading-relaxed text-neutral-slate">
                Belum ada agenda.
              </p>
            ) : (
              <ul className="space-y-3">
                {semester.items.map((item) => (
                  <li key={item.id} className="border-l-2 border-primary-teal/30 pl-3">
                    <p className="text-[11px] font-semibold text-primary-teal-deep">
                      {formatDateRange(item)}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-neutral-espresso">{item.judul}</p>
                    {item.kategori && (
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryBadgeClass(item.kategori)}`}
                      >
                        {item.kategori}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
