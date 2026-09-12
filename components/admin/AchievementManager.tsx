"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X, Loader2, Pencil, Trash2, Award, ImageOff } from "lucide-react";
import { upsertAchievement, deleteAchievement } from "@/lib/actions/profil-admin";

type AchievementItem = {
  id: string;
  judul: string;
  tingkat: "SEKOLAH" | "KECAMATAN" | "KABUPATEN" | "PROVINSI" | "NASIONAL";
  tahun: number;
  deskripsi: string | null;
  fotoUrl: string | null;
  atasNamaSiswa: string | null;
};

const TINGKAT_LABEL: Record<string, string> = {
  SEKOLAH: "Sekolah",
  KECAMATAN: "Kecamatan",
  KABUPATEN: "Kabupaten",
  PROVINSI: "Provinsi",
  NASIONAL: "Nasional",
};

export function AchievementManager({ achievements }: { achievements: AchievementItem[] }) {
  const [editing, setEditing] = useState<AchievementItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus data prestasi ini?")) return;
    setDeletingId(id);
    try {
      await deleteAchievement(id);
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
          Tambah Prestasi
        </button>
      </div>

      <div className="overflow-hidden rounded-card bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-espresso/10 bg-neutral-espresso/[0.03] text-xs font-bold uppercase tracking-wide text-neutral-slate">
                <th className="px-5 py-3">Foto</th>
                <th className="px-5 py-3">Prestasi</th>
                <th className="px-5 py-3">Tingkat</th>
                <th className="px-5 py-3">Tahun</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {achievements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-neutral-slate">
                    Belum ada data prestasi.
                  </td>
                </tr>
              ) : (
                achievements.map((a) => (
                  <tr key={a.id} className="border-b border-neutral-espresso/5 last:border-0 hover:bg-primary-teal/5">
                    <td className="px-5 py-3">
                      <div className="relative h-10 w-14 overflow-hidden rounded-lg bg-neutral-espresso/5">
                        {a.fotoUrl ? (
                          <Image src={a.fotoUrl} alt={a.judul} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageOff className="h-4 w-4 text-neutral-slate/40" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2.5">
                        <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary-teal" />
                        <div>
                          <p className="font-medium text-neutral-espresso">{a.judul}</p>
                          {a.atasNamaSiswa && (
                            <p className="text-xs text-neutral-slate">{a.atasNamaSiswa}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-slate">{TINGKAT_LABEL[a.tingkat]}</td>
                    <td className="px-5 py-3 text-neutral-slate">{a.tahun}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <AchievementFormModal
          achievement={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function AchievementFormModal({
  achievement,
  onClose,
}: {
  achievement: AchievementItem | null;
  onClose: () => void;
}) {
  const [judul, setJudul] = useState(achievement?.judul ?? "");
  const [tingkat, setTingkat] = useState<AchievementItem["tingkat"]>(
    achievement?.tingkat ?? "SEKOLAH"
  );
  const [tahun, setTahun] = useState(achievement?.tahun ?? new Date().getFullYear());
  const [deskripsi, setDeskripsi] = useState(achievement?.deskripsi ?? "");
  const [atasNamaSiswa, setAtasNamaSiswa] = useState(achievement?.atasNamaSiswa ?? "");
  const [preview, setPreview] = useState<string | null>(achievement?.fotoUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (achievement) formData.append("id", achievement.id);
      formData.append("judul", judul);
      formData.append("tingkat", tingkat);
      formData.append("tahun", String(tahun));
      formData.append("deskripsi", deskripsi);
      formData.append("atasNamaSiswa", atasNamaSiswa);
      if (achievement?.fotoUrl) formData.append("existingFotoUrl", achievement.fotoUrl);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("foto", fileInputRef.current.files[0]);
      }

      await upsertAchievement(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan prestasi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {achievement ? "Edit Prestasi" : "Tambah Prestasi"}
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
            <label className="text-sm font-semibold text-neutral-espresso">
              Foto (piala, kegiatan lomba, atau foto siswa)
            </label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-espresso/5">
                {preview ? (
                  <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-5 w-5 text-neutral-slate/40" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Judul Prestasi</label>
            <input
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="input-field mt-1.5"
              placeholder="Contoh: Juara 1 Lomba Cerdas Cermat"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Tingkat</label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value as AchievementItem["tingkat"])}
                className="input-field mt-1.5"
              >
                <option value="SEKOLAH">Sekolah</option>
                <option value="KECAMATAN">Kecamatan</option>
                <option value="KABUPATEN">Kabupaten</option>
                <option value="PROVINSI">Provinsi</option>
                <option value="NASIONAL">Nasional</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Tahun</label>
              <input
                type="number"
                required
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Atas Nama Siswa/Tim (opsional)
            </label>
            <input
              value={atasNamaSiswa}
              onChange={(e) => setAtasNamaSiswa(e.target.value)}
              className="input-field mt-1.5"
            />
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
