"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { updateSambutanKepsek } from "@/lib/actions/profil-admin";

type Teacher = { id: string; nama: string; isKepalaSekolah: boolean };

export function SambutanForm({
  teachers,
  currentKepsekId,
  currentSambutan,
}: {
  teachers: Teacher[];
  currentKepsekId: string | null;
  currentSambutan: string;
}) {
  const [teacherId, setTeacherId] = useState(currentKepsekId ?? "");
  const [sambutan, setSambutan] = useState(currentSambutan);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teacherId) {
      setError("Pilih guru yang menjabat sebagai Kepala Sekolah.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      await updateSambutanKepsek(teacherId, sambutan);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (teachers.length === 0) {
    return (
      <div className="rounded-card bg-white p-8 text-center text-sm text-neutral-slate shadow-soft">
        Belum ada data guru. Tambahkan guru terlebih dahulu di menu Guru Manager
        sebelum mengatur sambutan Kepala Sekolah.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white p-6 shadow-soft">
      <div>
        <label className="text-sm font-bold text-neutral-espresso">
          Guru yang menjabat sebagai Kepala Sekolah
        </label>
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="input-field mt-1.5"
        >
          <option value="">Pilih guru...</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nama} {t.isKepalaSekolah ? "(saat ini Kepala Sekolah)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label className="text-sm font-bold text-neutral-espresso">
          Teks Sambutan
        </label>
        <textarea
          rows={12}
          value={sambutan}
          onChange={(e) => setSambutan(e.target.value)}
          className="input-field mt-1.5 resize-none"
          placeholder="Tulis sambutan Kepala Sekolah. Pisahkan paragraf dengan baris baru."
        />
      </div>

      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 flex items-center gap-2 rounded-button bg-primary-teal px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saved ? "Tersimpan!" : "Simpan Sambutan"}
      </button>
    </form>
  );
}
