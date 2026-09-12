"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X, Loader2, Pencil, Trash2, ImageOff, Eye, EyeOff } from "lucide-react";
import { upsertFacility, deleteFacility } from "@/lib/actions/profil-admin";

type FacilityItem = {
  id: string;
  nama: string;
  deskripsi: string;
  gambarUrl: string;
  icon: string | null;
  urutan: number;
  isPublished: boolean;
};

export function FacilityManager({ facilities }: { facilities: FacilityItem[] }) {
  const [editing, setEditing] = useState<FacilityItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus fasilitas ini?")) return;
    setDeletingId(id);
    try {
      await deleteFacility(id);
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
          Tambah Fasilitas
        </button>
      </div>

      {facilities.length === 0 ? (
        <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
          Belum ada data fasilitas.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <div key={f.id} className="overflow-hidden rounded-card bg-white shadow-soft">
              <div className="relative aspect-video">
                <Image src={f.gambarUrl} alt={f.nama} fill className="object-cover" unoptimized />
                {!f.isPublished && (
                  <span className="absolute left-2 top-2 rounded-full bg-neutral-graphite/80 px-2 py-1 text-[10px] font-bold text-white">
                    Draft
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-neutral-espresso">{f.nama}</p>
                <p className="mt-1 text-xs text-neutral-slate line-clamp-2">{f.deskripsi}</p>
                <div className="mt-3 flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(f)}
                    className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === f.id}
                    onClick={() => handleDelete(f.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    {deletingId === f.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <FacilityFormModal
          facility={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

const ICON_OPTIONS = [
  "BookOpen", "HeartPulse", "Monitor", "Dumbbell", "Music", "Palette",
  "FlaskConical", "Users", "Utensils", "TreePine",
];

function FacilityFormModal({
  facility,
  onClose,
}: {
  facility: FacilityItem | null;
  onClose: () => void;
}) {
  const [nama, setNama] = useState(facility?.nama ?? "");
  const [deskripsi, setDeskripsi] = useState(facility?.deskripsi ?? "");
  const [icon, setIcon] = useState(facility?.icon ?? "BookOpen");
  const [urutan, setUrutan] = useState(facility?.urutan ?? 0);
  const [isPublished, setIsPublished] = useState(facility?.isPublished ?? true);
  const [preview, setPreview] = useState<string | null>(facility?.gambarUrl ?? null);
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
      if (facility) formData.append("id", facility.id);
      formData.append("nama", nama);
      formData.append("deskripsi", deskripsi);
      formData.append("icon", icon);
      formData.append("urutan", String(urutan));
      formData.append("isPublished", String(isPublished));
      if (facility?.gambarUrl) formData.append("existingGambarUrl", facility.gambarUrl);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("gambar", fileInputRef.current.files[0]);
      }

      await upsertFacility(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan fasilitas.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {facility ? "Edit Fasilitas" : "Tambah Fasilitas"}
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
              Gambar (rasio 16:9)
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
            <label className="text-sm font-semibold text-neutral-espresso">Nama</label>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Deskripsi</label>
            <textarea
              required
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="input-field mt-1.5 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Icon</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="input-field mt-1.5"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Urutan</label>
              <input
                type="number"
                value={urutan}
                onChange={(e) => setUrutan(Number(e.target.value))}
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPublished((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-neutral-espresso"
          >
            {isPublished ? (
              <Eye className="h-4 w-4 text-primary-teal" />
            ) : (
              <EyeOff className="h-4 w-4 text-neutral-slate" />
            )}
            {isPublished ? "Tampil di halaman publik" : "Draft (tidak tampil publik)"}
          </button>

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
