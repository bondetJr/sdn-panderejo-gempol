"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2, Pencil, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertPpdbWave, togglePpdbWaveActive, type WaveFormInput } from "@/lib/actions/ppdb-admin";

type Wave = {
  id: string;
  tahunAjaran: string;
  jalur: "ZONASI" | "AFIRMASI" | "PERPINDAHAN";
  kuota: number;
  kuotaTerisi: number;
  syaratText: string;
  tanggalBuka: Date;
  tanggalTutup: Date;
  isActive: boolean;
  _count: { applicants: number };
};

const JALUR_LABEL: Record<string, string> = {
  ZONASI: "Zonasi",
  AFIRMASI: "Afirmasi",
  PERPINDAHAN: "Perpindahan",
};

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}

export function PpdbWaveManager({ waves }: { waves: Wave[] }) {
  const [editing, setEditing] = useState<Wave | null | "new">(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 rounded-button bg-primary-teal px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Tambah Gelombang
        </button>
      </div>

      <div className="overflow-hidden rounded-card bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-espresso/10 bg-neutral-espresso/3 text-xs font-bold uppercase tracking-wide text-neutral-slate">
                <th className="px-5 py-3">Jalur</th>
                <th className="px-5 py-3">Tahun Ajaran</th>
                <th className="px-5 py-3">Kuota</th>
                <th className="px-5 py-3">Periode</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {waves.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-neutral-espresso/5 last:border-0 hover:bg-primary-teal/5"
                >
                  <td className="px-5 py-3 font-semibold text-neutral-espresso">
                    {JALUR_LABEL[w.jalur]}
                  </td>
                  <td className="px-5 py-3 text-neutral-slate">{w.tahunAjaran}</td>
                  <td className="px-5 py-3 text-neutral-slate">
                    {w._count.applicants} / {w.kuota}
                  </td>
                  <td className="px-5 py-3 text-xs text-neutral-slate">
                    {toDateInputValue(w.tanggalBuka)} — {toDateInputValue(w.tanggalTutup)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        w.isActive
                          ? "bg-primary-teal/10 text-primary-teal-deep"
                          : "bg-neutral-slate/10 text-neutral-slate"
                      )}
                    >
                      {w.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditing(w)}
                        className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await togglePpdbWaveActive(w.id, !w.isActive);
                          });
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-button bg-neutral-espresso/10 text-neutral-espresso hover:bg-neutral-espresso/20"
                        aria-label="Toggle aktif"
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <WaveFormModal
          wave={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function WaveFormModal({
  wave,
  onClose,
}: {
  wave: Wave | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    jalur: wave?.jalur ?? "ZONASI",
    tahunAjaran: wave?.tahunAjaran ?? "2026/2027",
    kuota: wave?.kuota ?? 32,
    syaratText: wave?.syaratText ?? "",
    tanggalBuka: wave ? toDateInputValue(wave.tanggalBuka) : "",
    tanggalTutup: wave ? toDateInputValue(wave.tanggalTutup) : "",
    isActive: wave?.isActive ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: WaveFormInput = {
      id: wave?.id,
      ...form,
    };

    try {
      await upsertPpdbWave(payload);
      onClose();
    } catch {
      setError("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {wave ? "Edit Gelombang" : "Tambah Gelombang PPDB"}
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
          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Jalur</label>
            <select
              value={form.jalur}
              onChange={(e) => setForm({ ...form, jalur: e.target.value as WaveFormInput["jalur"] })}
              className="input-field mt-1.5"
            >
              <option value="ZONASI">Zonasi</option>
              <option value="AFIRMASI">Afirmasi</option>
              <option value="PERPINDAHAN">Perpindahan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Tahun Ajaran
              </label>
              <input
                required
                value={form.tahunAjaran}
                onChange={(e) => setForm({ ...form, tahunAjaran: e.target.value })}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Kuota</label>
              <input
                required
                type="number"
                min={1}
                value={form.kuota}
                onChange={(e) => setForm({ ...form, kuota: Number(e.target.value) })}
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Tanggal Buka
              </label>
              <input
                required
                type="date"
                value={form.tanggalBuka}
                onChange={(e) => setForm({ ...form, tanggalBuka: e.target.value })}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Tanggal Tutup
              </label>
              <input
                required
                type="date"
                value={form.tanggalTutup}
                onChange={(e) => setForm({ ...form, tanggalTutup: e.target.value })}
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Syarat Pendaftaran (satu syarat per baris)
            </label>
            <textarea
              rows={4}
              value={form.syaratText}
              onChange={(e) => setForm({ ...form, syaratText: e.target.value })}
              placeholder={"Kartu Keluarga\nAkta Kelahiran\nKTP Orang Tua"}
              className="input-field mt-1.5 resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-espresso/30 text-primary-teal focus:ring-primary-teal"
            />
            <span className="text-sm text-neutral-espresso/80">
              Aktifkan gelombang ini (tampil di halaman publik)
            </span>
          </label>

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
