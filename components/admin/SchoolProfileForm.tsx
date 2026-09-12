"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { updateSchoolProfile } from "@/lib/actions/profil-admin";

type School = {
  id: string;
  visi: string | null;
  misi: string | null;
  sejarah: string | null;
  akreditasi: string | null;
  akreditasiTahun: number | null;
};

export function SchoolProfileForm({ school }: { school: School }) {
  const [visi, setVisi] = useState(school.visi ?? "");
  const [misi, setMisi] = useState(school.misi ?? "");
  const [sejarah, setSejarah] = useState(school.sejarah ?? "");
  const [akreditasi, setAkreditasi] = useState(school.akreditasi ?? "");
  const [akreditasiTahun, setAkreditasiTahun] = useState(
    school.akreditasiTahun?.toString() ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append("id", school.id);
      formData.append("visi", visi);
      formData.append("misi", misi);
      formData.append("sejarah", sejarah);
      formData.append("akreditasi", akreditasi);
      formData.append("akreditasiTahun", akreditasiTahun);

      await updateSchoolProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-card bg-white p-6 shadow-soft">
        <h2 className="text-sm font-bold text-neutral-espresso">Visi</h2>
        <textarea
          rows={2}
          value={visi}
          onChange={(e) => setVisi(e.target.value)}
          className="input-field mt-2 resize-none"
          placeholder="Tulis visi sekolah..."
        />

        <h2 className="mt-5 text-sm font-bold text-neutral-espresso">
          Misi (satu poin per baris)
        </h2>
        <textarea
          rows={6}
          value={misi}
          onChange={(e) => setMisi(e.target.value)}
          className="input-field mt-2 resize-none"
          placeholder={"Menanamkan nilai keagamaan...\nMenyelenggarakan pembelajaran aktif..."}
        />
      </div>

      <div className="rounded-card bg-white p-6 shadow-soft">
        <h2 className="text-sm font-bold text-neutral-espresso">
          Sejarah Sekolah
        </h2>
        <textarea
          rows={8}
          value={sejarah}
          onChange={(e) => setSejarah(e.target.value)}
          className="input-field mt-2 resize-none"
          placeholder="Tulis narasi sejarah sekolah. Pisahkan paragraf dengan baris baru."
        />
      </div>

      <div className="rounded-card bg-joy-butter/40 p-5 text-sm leading-relaxed text-neutral-espresso/80">
        <strong>Struktur Organisasi</strong> sekarang diatur di halaman terpisah
        (bukan upload gambar lagi) — data Kepala Sekolah & Guru/Tendik otomatis
        diambil dari Guru Manager, tinggal atur data Komite Sekolah di{" "}
        <a href="/admin/profil/struktur" className="font-semibold underline">
          Profil Manager &gt; Struktur Organisasi
        </a>
        .
      </div>

      <div className="rounded-card bg-white p-6 shadow-soft">
        <h2 className="text-sm font-bold text-neutral-espresso">Akreditasi</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-neutral-slate">Peringkat</label>
            <select
              value={akreditasi}
              onChange={(e) => setAkreditasi(e.target.value)}
              className="input-field mt-1"
            >
              <option value="">-</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-slate">Tahun</label>
            <input
              type="number"
              value={akreditasiTahun}
              onChange={(e) => setAkreditasiTahun(e.target.value)}
              className="input-field mt-1"
              placeholder="2024"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-button bg-primary-teal px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
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
