"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, X, Loader2, Pencil, Trash2, ImageOff, Images } from "lucide-react";
import { upsertAlbum, deleteAlbum } from "@/lib/actions/informasi-admin";

type AlbumItem = {
  id: string;
  judul: string;
  deskripsi: string | null;
  coverUrl: string | null;
  _count: { photos: number };
};

export function AlbumManager({ albums }: { albums: AlbumItem[] }) {
  const [editing, setEditing] = useState<AlbumItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus album ini beserta semua fotonya?")) return;
    setDeletingId(id);
    try {
      await deleteAlbum(id);
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
          Buat Album
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
          Belum ada album kegiatan siswa.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <div key={album.id} className="overflow-hidden rounded-card bg-white shadow-soft">
              <Link href={`/admin/informasi/galeri/${album.id}`}>
                <div className="relative aspect-[4/3]">
                  {album.coverUrl ? (
                    <Image src={album.coverUrl} alt={album.judul} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary-teal/10">
                      <ImageOff className="h-8 w-8 text-primary-teal-deep/40" />
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-neutral-graphite/70 px-2 py-1 text-[10px] font-semibold text-white">
                    <Images className="h-3 w-3" />
                    {album._count.photos} foto
                  </span>
                </div>
              </Link>
              <div className="flex items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-neutral-espresso">
                    {album.judul}
                  </p>
                  <Link
                    href={`/admin/informasi/galeri/${album.id}`}
                    className="text-xs font-semibold text-primary-teal-deep hover:underline"
                  >
                    Kelola Foto →
                  </Link>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(album)}
                    className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === album.id}
                    onClick={() => handleDelete(album.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    {deletingId === album.id ? (
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
        <AlbumFormModal album={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function AlbumFormModal({
  album,
  onClose,
}: {
  album: AlbumItem | null;
  onClose: () => void;
}) {
  const [judul, setJudul] = useState(album?.judul ?? "");
  const [deskripsi, setDeskripsi] = useState(album?.deskripsi ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await upsertAlbum({ id: album?.id, judul, deskripsi });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan album.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {album ? "Edit Album" : "Buat Album Baru"}
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
              Judul Album
            </label>
            <input
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
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
