"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function TestimonialForm() {
  const [form, setForm] = useState({ nama: "", peran: "", pesan: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/kontak/testimoni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Gagal mengirim testimoni.");
        return;
      }
      setSuccess(true);
      setForm({ nama: "", peran: "", pesan: "", rating: 5 });
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-card bg-white p-6 text-center shadow-soft">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h3 className="mt-3 text-base font-bold text-neutral-espresso">
          Terima Kasih!
        </h3>
        <p className="mt-1 text-sm text-neutral-slate">
          Testimoni Bapak/Ibu akan tampil setelah ditinjau oleh admin.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm font-semibold text-primary-teal-deep hover:underline"
        >
          Tulis testimoni lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white p-6 shadow-soft">
      <h3 className="text-base font-bold text-neutral-espresso">
        Tulis Testimoni Anda
      </h3>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Nama Lengkap"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className="input-field"
        />
        <input
          required
          placeholder="Contoh: Wali Murid Kelas 2B"
          value={form.peran}
          onChange={(e) => setForm({ ...form, peran: e.target.value })}
          className="input-field"
        />
      </div>

      <textarea
        required
        rows={4}
        placeholder="Ceritakan pengalaman Bapak/Ibu..."
        value={form.pesan}
        onChange={(e) => setForm({ ...form, pesan: e.target.value })}
        className="input-field mt-3 resize-none"
      />

      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-neutral-espresso">
          Rating:
        </span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setForm({ ...form, rating: star })}
            aria-label={`${star} bintang`}
          >
            <Star
              className={cn(
                "h-5 w-5",
                star <= form.rating
                  ? "fill-joy-butter text-joy-butter"
                  : "text-neutral-espresso/20"
              )}
            />
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex items-center justify-center gap-2 rounded-button bg-primary-teal px-6 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {submitting ? "Mengirim..." : "Kirim Testimoni"}
      </button>
    </form>
  );
}
