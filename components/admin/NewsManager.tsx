"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X, Loader2, Pencil, Trash2, ImageOff } from "lucide-react";
import { cn, formatTanggalId } from "@/lib/utils";
import { upsertNews, deleteNews } from "@/lib/actions/informasi-admin";

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date | null;
  createdAt: Date;
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-neutral-slate/10 text-neutral-slate",
  PUBLISHED: "bg-primary-teal/10 text-primary-teal-deep",
  ARCHIVED: "bg-amber-50 text-amber-700",
};

export function NewsManager({ news }: { news: NewsItem[] }) {
  const [editing, setEditing] = useState<NewsItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus berita ini? Tindakan tidak dapat dibatalkan.")) return;
    setDeletingId(id);
    try {
      await deleteNews(id);
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
          Tulis Berita
        </button>
      </div>

      <div className="overflow-hidden rounded-card bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-espresso/10 bg-neutral-espresso/[0.03] text-xs font-bold uppercase tracking-wide text-neutral-slate">
                <th className="px-5 py-3">Judul</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {news.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-neutral-slate">
                    Belum ada berita. Klik &quot;Tulis Berita&quot; untuk membuat.
                  </td>
                </tr>
              ) : (
                news.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-neutral-espresso/5 last:border-0 hover:bg-primary-teal/5"
                  >
                    <td className="max-w-xs px-5 py-3 font-medium text-neutral-espresso">
                      {n.title}
                    </td>
                    <td className="px-5 py-3 text-neutral-slate">
                      {formatTanggalId(n.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-bold",
                          STATUS_BADGE[n.status]
                        )}
                      >
                        {n.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditing(n)}
                          className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === n.id}
                          onClick={() => handleDelete(n.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          {deletingId === n.id ? (
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
        <NewsFormModal news={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function NewsFormModal({
  news,
  onClose,
}: {
  news: NewsItem | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(news?.title ?? "");
  const [excerpt, setExcerpt] = useState(news?.excerpt ?? "");
  const [content, setContent] = useState(news?.content ?? "");
  const [status, setStatus] = useState(news?.status ?? "DRAFT");
  const [preview, setPreview] = useState<string | null>(news?.coverImageUrl ?? null);
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
      if (news) formData.append("id", news.id);
      formData.append("title", title);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      formData.append("status", status);
      if (news?.coverImageUrl) formData.append("existingCoverUrl", news.coverImageUrl);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("coverImage", fileInputRef.current.files[0]);
      }

      await upsertNews(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan berita.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {news ? "Edit Berita" : "Tulis Berita Baru"}
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
              Gambar Sampul
            </label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-neutral-espresso/5">
                {preview ? (
                  <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-6 w-6 text-neutral-slate/40" />
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
            <label className="text-sm font-semibold text-neutral-espresso">Judul</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Ringkasan Singkat
            </label>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Muncul di card daftar berita"
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Isi Berita
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis isi berita di sini. Pisahkan paragraf dengan baris baru."
              className="input-field mt-1.5 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="input-field mt-1.5"
            >
              <option value="DRAFT">Draft (belum tampil publik)</option>
              <option value="PUBLISHED">Publish sekarang</option>
              <option value="ARCHIVED">Arsipkan</option>
            </select>
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
