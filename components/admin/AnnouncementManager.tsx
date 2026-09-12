"use client";

import { useState } from "react";
import { Plus, X, Loader2, Pencil, Trash2, Megaphone } from "lucide-react";
import { cn, formatTanggalId } from "@/lib/utils";
import { upsertAnnouncement, deleteAnnouncement } from "@/lib/actions/informasi-admin";

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  isPenting: boolean;
  publishedAt: Date;
  expiresAt: Date | null;
};

export function AnnouncementManager({
  announcements,
}: {
  announcements: AnnouncementItem[];
}) {
  const [editing, setEditing] = useState<AnnouncementItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus pengumuman ini?")) return;
    setDeletingId(id);
    try {
      await deleteAnnouncement(id);
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
          Buat Pengumuman
        </button>
      </div>

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
            Belum ada pengumuman.
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className={cn(
                "flex items-start justify-between gap-4 rounded-card p-5 shadow-soft",
                a.isPenting ? "bg-joy-butter/50" : "bg-white"
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    a.isPenting
                      ? "bg-joy-butter text-neutral-espresso"
                      : "bg-primary-teal/10 text-primary-teal-deep"
                  )}
                >
                  <Megaphone className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    {a.isPenting && (
                      <span className="rounded-full bg-neutral-espresso px-2 py-0.5 text-[10px] font-bold text-white">
                        PENTING
                      </span>
                    )}
                    <p className="text-xs text-neutral-slate">
                      {formatTanggalId(a.publishedAt)}
                    </p>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-neutral-espresso">
                    {a.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-espresso/80 line-clamp-2">
                    {a.content}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
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
            </div>
          ))
        )}
      </div>

      {editing && (
        <AnnouncementFormModal
          announcement={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function AnnouncementFormModal({
  announcement,
  onClose,
}: {
  announcement: AnnouncementItem | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [content, setContent] = useState(announcement?.content ?? "");
  const [isPenting, setIsPenting] = useState(announcement?.isPenting ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await upsertAnnouncement({
        id: announcement?.id,
        title,
        content,
        isPenting,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengumuman.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {announcement ? "Edit Pengumuman" : "Buat Pengumuman"}
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
            <label className="text-sm font-semibold text-neutral-espresso">Judul</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Isi</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field mt-1.5 resize-none"
            />
          </div>
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isPenting}
              onChange={(e) => setIsPenting(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-espresso/30 text-primary-teal focus:ring-primary-teal"
            />
            <span className="text-sm text-neutral-espresso/80">
              Tandai sebagai <strong>Penting</strong> (tampil dengan highlight kuning)
            </span>
          </label>

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
