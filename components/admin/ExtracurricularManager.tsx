"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X, Loader2, Pencil, Trash2, ImageOff, Palette } from "lucide-react";
import { upsertExtracurricular, deleteExtracurricular } from "@/lib/actions/akademik-admin";

type ExtracurricularItem = {
  id: string;
  nama: string;
  deskripsi: string | null;
  jadwal: string | null;
  fotoUrl: string | null;
  pembinaId: string | null;
  pembina: { id: string; nama: string } | null;
};

type TeacherOption = { id: string; nama: string };

export function ExtracurricularManager({
  items,
  teachers,
}: {
  items: ExtracurricularItem[];
  teachers: TeacherOption[];
}) {
  const [editing, setEditing] = useState<ExtracurricularItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus ekstrakurikuler ini?")) return;
    setDeletingId(id);
    try {
      await deleteExtracurricular(id);
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
          Tambah Ekstrakurikuler
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
          Belum ada data ekstrakurikuler.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-card bg-white shadow-soft">
              <div className="relative flex h-32 items-center justify-center bg-primary-teal/10">
                {item.fotoUrl ? (
                  <Image src={item.fotoUrl} alt={item.nama} fill className="object-cover" unoptimized />
                ) : (
                  <Palette className="h-8 w-8 text-primary-teal-deep/40" />
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-neutral-espresso">{item.nama}</p>
                <p className="mt-1 text-xs text-neutral-slate">
                  {item.jadwal ?? "Jadwal belum diatur"}
                </p>
                <p className="text-xs text-neutral-slate">
                  Pembina: {item.pembina?.nama ?? "-"}
                </p>
                <div className="mt-3 flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    {deletingId === item.id ? (
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
        <ExtracurricularFormModal
          item={editing === "new" ? null : editing}
          teachers={teachers}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ExtracurricularFormModal({
  item,
  teachers,
  onClose,
}: {
  item: ExtracurricularItem | null;
  teachers: TeacherOption[];
  onClose: () => void;
}) {
  const [nama, setNama] = useState(item?.nama ?? "");
  const [deskripsi, setDeskripsi] = useState(item?.deskripsi ?? "");
  const [jadwal, setJadwal] = useState(item?.jadwal ?? "");
  const [pembinaId, setPembinaId] = useState(item?.pembinaId ?? "");
  const [preview, setPreview] = useState<string | null>(item?.fotoUrl ?? null);
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
      if (item) formData.append("id", item.id);
      formData.append("nama", nama);
      formData.append("deskripsi", deskripsi);
      formData.append("jadwal", jadwal);
      formData.append("pembinaId", pembinaId);
      if (item?.fotoUrl) formData.append("existingFotoUrl", item.fotoUrl);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("foto", fileInputRef.current.files[0]);
      }

      await upsertExtracurricular(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {item ? "Edit Ekstrakurikuler" : "Tambah Ekstrakurikuler"}
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
            <label className="text-sm font-semibold text-neutral-espresso">Foto</label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-espresso/5">
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
            <label className="text-sm font-semibold text-neutral-espresso">Jadwal</label>
            <input
              value={jadwal}
              onChange={(e) => setJadwal(e.target.value)}
              placeholder="Contoh: Jumat, 13.00 - 15.00 WIB"
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Pembina</label>
            <select
              value={pembinaId}
              onChange={(e) => setPembinaId(e.target.value)}
              className="input-field mt-1.5"
            >
              <option value="">- Belum ditentukan -</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Deskripsi
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
