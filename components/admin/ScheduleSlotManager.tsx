"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Trash2, Pencil, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/lib/subjects";
import {
  upsertScheduleSlot,
  deleteScheduleSlot,
  type ScheduleSlotInput,
} from "@/lib/actions/akademik-admin";

type SlotItem = {
  id: string;
  tingkat: number;
  hari: string;
  hariIndex: number;
  jamKe: number;
  waktu: string;
  subjectId: string;
};

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

function getSubjectLabel(subjectId: string) {
  if (subjectId === "istirahat") return "Istirahat";
  return SUBJECTS.find((s) => s.id === subjectId)?.nama ?? subjectId;
}

function getSubjectBadge(subjectId: string) {
  if (subjectId === "istirahat") return "bg-neutral-espresso/10 text-neutral-slate";
  return SUBJECTS.find((s) => s.id === subjectId)?.badgeClass ?? "bg-neutral-espresso/10 text-neutral-slate";
}

export function ScheduleSlotManager({ slots }: { slots: SlotItem[] }) {
  const router = useRouter();
  const [tingkat, setTingkat] = useState(1);
  const [editing, setEditing] = useState<{ slot: SlotItem | null; hari: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const slotsForTingkat = useMemo(
    () => slots.filter((s) => s.tingkat === tingkat),
    [slots, tingkat]
  );

  async function handleDelete(id: string) {
    if (!confirm("Hapus slot jadwal ini?")) return;
    setDeletingId(id);
    try {
      await deleteScheduleSlot(id);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Selector Tingkat */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTingkat(t)}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-button px-4 text-sm font-bold transition-colors",
              tingkat === t
                ? "bg-primary-teal text-white shadow-soft"
                : "bg-white text-neutral-espresso hover:bg-primary-teal/10"
            )}
          >
            Kelas {t}
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-neutral-slate">
        Jadwal berlaku untuk semua rombel paralel di Kelas {tingkat} (mis. {tingkat}A, {tingkat}B, {tingkat}C).
      </p>

      {/* Grid per hari */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {HARI_LIST.map((hari) => {
          const daySlots = slotsForTingkat
            .filter((s) => s.hari === hari)
            .sort((a, b) => a.jamKe - b.jamKe);

          return (
            <div key={hari} className="overflow-hidden rounded-card bg-white shadow-soft">
              <div className="flex items-center justify-between bg-primary-teal-deep px-4 py-2.5">
                <h3 className="text-sm font-bold text-white">{hari}</h3>
                <button
                  type="button"
                  onClick={() => setEditing({ slot: null, hari })}
                  className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/25"
                >
                  <Plus className="h-3 w-3" />
                  Tambah
                </button>
              </div>

              {daySlots.length === 0 ? (
                <p className="p-4 text-center text-xs text-neutral-slate">
                  Belum ada jadwal untuk hari ini.
                </p>
              ) : (
                <ul className="divide-y divide-neutral-espresso/5">
                  {daySlots.map((slot) => (
                    <li
                      key={slot.id}
                      className="flex items-center justify-between gap-2 px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex items-center gap-1 text-[11px] text-neutral-slate shrink-0">
                          <Clock className="h-3 w-3" />
                          {slot.waktu}
                        </span>
                        <span
                          className={cn(
                            "truncate rounded-lg px-2 py-1 text-[11px] font-semibold",
                            getSubjectBadge(slot.subjectId)
                          )}
                        >
                          {getSubjectLabel(slot.subjectId)}
                        </span>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing({ slot, hari })}
                          className="flex h-7 w-7 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === slot.id}
                          onClick={() => handleDelete(slot.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          {deletingId === slot.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <SlotFormModal
          tingkat={tingkat}
          hari={editing.hari}
          slot={editing.slot}
          onClose={() => setEditing(null)}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}

function SlotFormModal({
  tingkat,
  hari,
  slot,
  onClose,
  onSaved,
}: {
  tingkat: number;
  hari: string;
  slot: SlotItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [jamKe, setJamKe] = useState(slot?.jamKe ?? 1);
  const [waktu, setWaktu] = useState(slot?.waktu ?? "");
  const [subjectId, setSubjectId] = useState(slot?.subjectId ?? SUBJECTS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input: ScheduleSlotInput = {
        id: slot?.id,
        tingkat,
        hari,
        jamKe,
        waktu,
        subjectId,
      };
      await upsertScheduleSlot(input);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan jadwal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {slot ? "Edit" : "Tambah"} Jadwal — {hari}, Kelas {tingkat}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-espresso/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Jam Ke
              </label>
              <input
                type="number"
                required
                min={0}
                value={jamKe}
                onChange={(e) => setJamKe(Number(e.target.value))}
                className="input-field mt-1.5"
              />
              <p className="mt-1 text-[10px] text-neutral-slate">0 = istirahat</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Waktu
              </label>
              <input
                required
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                placeholder="07.00 - 07.35"
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Mata Pelajaran
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="input-field mt-1.5"
            >
              <option value="istirahat">Istirahat</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-2 border-t border-neutral-espresso/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-button px-4 py-2.5 text-sm font-semibold text-neutral-slate hover:bg-neutral-espresso/5"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-button bg-primary-teal px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
