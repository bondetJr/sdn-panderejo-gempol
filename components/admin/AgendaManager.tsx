"use client";

import { useState } from "react";
import { Plus, X, Loader2, Pencil, Trash2, CalendarDays } from "lucide-react";
import { formatTanggalId } from "@/lib/utils";
import { upsertAgenda, deleteAgenda, type AgendaInput } from "@/lib/actions/akademik-admin";

type AgendaItem = {
  id: string;
  judul: string;
  deskripsi: string | null;
  tanggalMulai: Date;
  tanggalSelesai: Date | null;
  kategori: string | null;
};

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}

export function AgendaManager({ agenda }: { agenda: AgendaItem[] }) {
  const [editing, setEditing] = useState<AgendaItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus agenda ini?")) return;
    setDeletingId(id);
    try {
      await deleteAgenda(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 rounded-button bg-primary-teal px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Tambah Agenda
        </button>
      </div>

      <div className="space-y-3">
        {agenda.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
            Belum ada agenda.
          </div>
        ) : (
          agenda.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 rounded-card bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-neutral-slate">
                    {formatTanggalId(a.tanggalMulai)}
                    {a.tanggalSelesai && ` — ${formatTanggalId(a.tanggalSelesai)}`}
                    {a.kategori && ` · ${a.kategori}`}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-neutral-espresso">{a.judul}</h3>
                  {a.deskripsi && (
                    <p className="mt-1 text-sm text-neutral-espresso/80">{a.deskripsi}</p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={deletingId === a.id}
                  onClick={() => handleDelete(a.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                >
                  {deletingId === a.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <AgendaFormModal agenda={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function AgendaFormModal({
  agenda,
  onClose,
}: {
  agenda: AgendaItem | null;
  onClose: () => void;
}) {
  const [judul, setJudul] = useState(agenda?.judul ?? "");
  const [deskripsi, setDeskripsi] = useState(agenda?.deskripsi ?? "");
  const [kategori, setKategori] = useState(agenda?.kategori ?? "Kalender Akademik");
  const [tanggalMulai, setTanggalMulai] = useState(
    agenda ? toDateInputValue(agenda.tanggalMulai) : ""
  );
  const [tanggalSelesai, setTanggalSelesai] = useState(
    agenda?.tanggalSelesai ? toDateInputValue(agenda.tanggalSelesai) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input: AgendaInput = {
        id: agenda?.id,
        judul,
        deskripsi,
        kategori,
        tanggalMulai,
        tanggalSelesai: tanggalSelesai || undefined,
      };
      await upsertAgenda(input);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan agenda.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {agenda ? "Edit Agenda" : "Tambah Agenda"}
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
            <label className="text-sm font-semibold text-neutral-espresso">Judul</label>
            <input
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="input-field mt-1.5"
            >
              <option value="Kalender Akademik">Kalender Akademik</option>
              <option value="Kegiatan">Kegiatan</option>
              <option value="Libur">Libur</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Tanggal Mulai
              </label>
              <input
                required
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Deskripsi (opsional)
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="input-field mt-1.5 resize-none"
            />
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
