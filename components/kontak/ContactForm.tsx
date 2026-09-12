"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    subjek: "",
    pesan: "",
    isPengaduan: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/kontak/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Gagal mengirim pesan.");
        return;
      }
      setSuccess(true);
      setForm({ nama: "", email: "", telepon: "", subjek: "", pesan: "", isPengaduan: false });
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-card bg-white p-8 text-center shadow-soft">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-neutral-espresso">
          Pesan Terkirim!
        </h3>
        <p className="mt-1.5 text-sm text-neutral-slate">
          Terima kasih, pesan Bapak/Ibu sudah kami terima dan akan segera
          ditindaklanjuti oleh operator sekolah.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-5 text-sm font-semibold text-primary-teal-deep hover:underline"
        >
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card bg-white p-6 shadow-soft sm:p-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-neutral-espresso">
            Nama Lengkap
          </label>
          <input
            required
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="input-field mt-1.5"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-neutral-espresso">
            No. Telepon (opsional)
          </label>
          <input
            value={form.telepon}
            onChange={(e) => setForm({ ...form, telepon: e.target.value })}
            placeholder="08xxxxxxxxxx"
            className="input-field mt-1.5"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-neutral-espresso">
          Email (opsional)
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-field mt-1.5"
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-neutral-espresso">
          Subjek
        </label>
        <input
          required
          value={form.subjek}
          onChange={(e) => setForm({ ...form, subjek: e.target.value })}
          placeholder="Contoh: Pertanyaan tentang PPDB"
          className="input-field mt-1.5"
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-neutral-espresso">
          Pesan
        </label>
        <textarea
          required
          rows={5}
          value={form.pesan}
          onChange={(e) => setForm({ ...form, pesan: e.target.value })}
          className="input-field mt-1.5 resize-none"
        />
      </div>

      <label className="mt-4 flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={form.isPengaduan}
          onChange={(e) => setForm({ ...form, isPengaduan: e.target.checked })}
          className="h-4 w-4 rounded border-neutral-espresso/30 text-primary-teal focus:ring-primary-teal"
        />
        <span className="text-sm text-neutral-espresso/80">
          Ini adalah pengaduan / laporan yang perlu perhatian khusus
        </span>
      </label>

      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "mt-6 flex w-full items-center justify-center gap-2 rounded-button px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto",
          "bg-primary-teal"
        )}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {submitting ? "Mengirim..." : "Kirim Pesan"}
      </button>
    </form>
  );
}
