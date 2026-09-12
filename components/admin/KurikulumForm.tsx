"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { updateKurikulum } from "@/lib/actions/akademik-admin";

export function KurikulumForm({
  schoolId,
  initialText,
}: {
  schoolId: string;
  initialText: string;
}) {
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await updateKurikulum(schoolId, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white p-6 shadow-soft">
      <label className="text-sm font-bold text-neutral-espresso">
        Konten Halaman Kurikulum
      </label>
      <p className="mt-1 text-xs text-neutral-slate">
        Tampil di halaman publik <code>/akademik/kurikulum</code>. Pisahkan
        paragraf dengan baris baru.
      </p>
      <textarea
        rows={14}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input-field mt-3 resize-none"
        placeholder="Tulis penjelasan kurikulum yang diterapkan sekolah..."
      />

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
        {saved ? "Tersimpan!" : "Simpan Perubahan"}
      </button>
    </form>
  );
}
