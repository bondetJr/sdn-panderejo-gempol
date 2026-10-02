"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save, Award } from "lucide-react";
import { updateSchoolProfile } from "@/lib/actions/profil-admin";

type School = {
  id: string;
  akreditasi: string | null;
  akreditasiTahun: number | null;
};

export function AkreditasiForm({ school }: { school: School }) {
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
      formData.append("akreditasi", akreditasi);
      formData.append("akreditasiTahun", akreditasiTahun);
      // Visi Misi Sejarah dikosongkan biar tidak overwrite - action akan handle partial update
      // Tapi kita perlu kirim existing values, jadi kita fetch dari server atau biarkan action handle partial
      // Untuk sekarang, kita kirim kosong, dan di action kita akan merge dengan existing data
      // Solusi: action sudah support partial, tapi kita tetap kirim visi/misi/sejarah kosong tidak masalah karena akan overwrite
      // Jadi kita perlu ambil data lengkap - alternatif: buat action khusus akreditasi
      // Untuk fix cepat, kita kirim akreditasi saja dan di action kita update hanya akreditasi

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
    <form onSubmit={handleSubmit} className="rounded-card bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
          <Award className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-bold text-neutral-espresso">Akreditasi Sekolah</h2>
      </div>
      <p className="mt-2 text-xs text-neutral-slate">
        Data ini tampil di halaman Profil &gt; Prestasi & Akreditasi di website publik.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-neutral-espresso">Peringkat Akreditasi</label>
          <select
            value={akreditasi}
            onChange={(e) => setAkreditasi(e.target.value)}
            className="input-field mt-1.5"
          >
            <option value="">- Belum ada -</option>
            <option value="A">A (Unggul)</option>
            <option value="B">B (Baik)</option>
            <option value="C">C (Cukup)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-espresso">Tahun Akreditasi</label>
          <input
            type="number"
            value={akreditasiTahun}
            onChange={(e) => setAkreditasiTahun(e.target.value)}
            className="input-field mt-1.5"
            placeholder="2024"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex items-center gap-2 rounded-button bg-primary-teal px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? "Tersimpan!" : "Simpan Akreditasi"}
      </button>
    </form>
  );
}
