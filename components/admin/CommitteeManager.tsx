"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X, Loader2, Pencil, Trash2, ImageOff, User } from "lucide-react";
import { upsertCommitteeMember, deleteCommitteeMember } from "@/lib/actions/profil-admin";

type CommitteeItem = {
  id: string;
  nama: string;
  jabatan: string;
  fotoUrl: string | null;
  urutan: number;
};

export function CommitteeManager({ members }: { members: CommitteeItem[] }) {
  const [editing, setEditing] = useState<CommitteeItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus anggota komite ini?")) return;
    setDeletingId(id);
    try {
      await deleteCommitteeMember(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 rounded-card bg-white p-5 shadow-soft">
        <p className="text-sm text-neutral-espresso/80">
          Data ini adalah <strong>Level 2</strong> pada bagan Struktur Organisasi
          publik. Level 1 (Kepala Sekolah) dan Level 3 (Guru & Tendik) otomatis
          diambil dari Guru Manager — tidak perlu diisi manual di sini.
        </p>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 rounded-button bg-primary-teal px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Tambah Anggota Komite
        </button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
          Belum ada data Komite Sekolah.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-card bg-white p-4 shadow-soft">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary-teal/10">
                {m.fotoUrl ? (
                  <Image src={m.fotoUrl} alt={m.nama} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary-teal-deep">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-neutral-espresso">{m.nama}</p>
                <p className="truncate text-xs text-primary-teal-deep">{m.jabatan}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditing(m)}
                  className="flex h-7 w-7 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={deletingId === m.id}
                  onClick={() => handleDelete(m.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                >
                  {deletingId === m.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CommitteeFormModal
          member={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CommitteeFormModal({
  member,
  onClose,
}: {
  member: CommitteeItem | null;
  onClose: () => void;
}) {
  const [nama, setNama] = useState(member?.nama ?? "");
  const [jabatan, setJabatan] = useState(member?.jabatan ?? "");
  const [urutan, setUrutan] = useState(member?.urutan ?? 0);
  const [preview, setPreview] = useState<string | null>(member?.fotoUrl ?? null);
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
      if (member) formData.append("id", member.id);
      formData.append("nama", nama);
      formData.append("jabatan", jabatan);
      formData.append("urutan", String(urutan));
      if (member?.fotoUrl) formData.append("existingFotoUrl", member.fotoUrl);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("foto", fileInputRef.current.files[0]);
      }

      await upsertCommitteeMember(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {member ? "Edit Anggota Komite" : "Tambah Anggota Komite"}
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
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-neutral-espresso/5">
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
            <label className="text-sm font-semibold text-neutral-espresso">Nama Lengkap</label>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Jabatan</label>
            <input
              required
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Contoh: Ketua Komite Sekolah"
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Urutan</label>
            <input
              type="number"
              value={urutan}
              onChange={(e) => setUrutan(Number(e.target.value))}
              className="input-field mt-1.5 max-w-[120px]"
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
