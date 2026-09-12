"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, Trash2 } from "lucide-react";
import {
  addGalleryPhotos,
  deleteGalleryPhoto,
  updateGalleryPhoto,
} from "@/lib/actions/informasi-admin";

type Photo = { id: string; url: string; caption: string | null; deskripsi: string | null };

export function AlbumPhotoManager({
  albumId,
  photos,
}: {
  albumId: string;
  photos: Photo[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState(
    Object.fromEntries(
      photos.map((photo) => [
        photo.id,
        { caption: photo.caption ?? "", deskripsi: photo.deskripsi ?? "" },
      ])
    )
  );

  async function handleUpload() {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("photos", f));
      await addGalleryPhotos(albumId, formData);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photoId: string) {
    if (!confirm("Hapus foto ini?")) return;
    setDeletingId(photoId);
    try {
      await deleteGalleryPhoto(photoId, albumId);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSave(photoId: string) {
    const draft = drafts[photoId];
    if (!draft) return;
    setSavingId(photoId);
    setError(null);
    try {
      await updateGalleryPhoto(photoId, albumId, draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan keterangan foto.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      {/* Upload area */}
      <div className="rounded-card bg-white p-6 shadow-soft">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-espresso/15 p-8 text-center hover:border-primary-teal/40">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary-teal" />
          ) : (
            <UploadCloud className="h-6 w-6 text-primary-teal" />
          )}
          <span className="text-sm font-semibold text-neutral-espresso">
            {uploading ? "Mengunggah..." : "Klik untuk pilih foto (bisa banyak sekaligus)"}
          </span>
          <span className="text-xs text-neutral-slate">JPG, PNG, atau WebP</span>
        </label>
        {error && (
          <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
      </div>

      {/* Grid foto */}
      {photos.length === 0 ? (
        <div className="mt-5 rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
          Belum ada foto di album ini.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
              <div className="group relative aspect-square">
                <Image src={photo.url} alt={photo.caption ?? "Foto kegiatan siswa"} fill className="object-cover" unoptimized />
                {(photo.caption || photo.deskripsi) && (
                  <div className="absolute inset-x-0 bottom-0 bg-neutral-graphite/75 p-2 text-white">
                    {photo.caption && <p className="text-xs font-bold">{photo.caption}</p>}
                    {photo.deskripsi && <p className="mt-0.5 line-clamp-2 text-[10px]">{photo.deskripsi}</p>}
                  </div>
                )}
                <button
                  type="button"
                  disabled={deletingId === photo.id}
                  onClick={() => handleDelete(photo.id)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {deletingId === photo.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="space-y-2 p-3">
                <input
                  value={drafts[photo.id]?.caption ?? ""}
                  onChange={(e) =>
                    setDrafts((current) => ({
                      ...current,
                      [photo.id]: { ...current[photo.id], caption: e.target.value },
                    }))
                  }
                  placeholder="Judul gambar"
                  className="input-field text-xs"
                />
                <textarea
                  value={drafts[photo.id]?.deskripsi ?? ""}
                  onChange={(e) =>
                    setDrafts((current) => ({
                      ...current,
                      [photo.id]: { ...current[photo.id], deskripsi: e.target.value },
                    }))
                  }
                  placeholder="Deskripsi singkat"
                  rows={2}
                  className="input-field resize-none text-xs"
                />
                <button
                  type="button"
                  disabled={savingId === photo.id}
                  onClick={() => handleSave(photo.id)}
                  className="w-full rounded-button bg-primary-teal px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {savingId === photo.id ? "Menyimpan..." : "Simpan keterangan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
