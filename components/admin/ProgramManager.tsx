"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Plus, X, Loader2, Pencil, Trash2, ImageOff, Eye, EyeOff } from "lucide-react";
import { upsertProgram, deleteProgram } from "@/lib/actions/profil-admin";

type ProgramItem = {
  id: string;
  nama: string;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  fotoUrl: string | null;
  realisasiText: string | null;
  impactUtama: string | null;
  impactSatu: string | null;
  impactDua: string | null;
  impactTiga: string | null;
  subImages: { id: string; url: string; urutan: number }[];
  icon: string;
  urutan: number;
  isPublished: boolean;
};

const ICON_OPTIONS = [
  "HeartHandshake", "Smile", "BookOpenCheck", "Leaf", "Trophy", "ListChecks",
  "Sparkles", "Users", "Music", "Palette", "FlaskConical", "Star",
];

function getIcon(name: string): LucideIcon {
  return (LucideIcons[name as keyof typeof LucideIcons] as LucideIcon) ?? LucideIcons.Sparkles;
}

export function ProgramManager({ programs }: { programs: ProgramItem[] }) {
  const [editing, setEditing] = useState<ProgramItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus program unggulan ini?")) return;
    setDeletingId(id);
    try {
      await deleteProgram(id);
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
          Tambah Program
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
          Belum ada data Program Unggulan. Halaman Beranda saat ini menampilkan 6
          program contoh bawaan sistem.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => {
            const Icon = getIcon(p.icon);
            return (
              <div key={p.id} className="overflow-hidden rounded-card bg-white shadow-soft">
                <div className="relative aspect-video bg-primary-teal/10">
                  {p.fotoUrl ? (
                    <Image src={p.fotoUrl} alt={p.nama} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff className="h-8 w-8 text-primary-teal-deep/30" />
                    </div>
                  )}
                  {!p.isPublished && (
                    <span className="absolute left-2 top-2 rounded-full bg-neutral-graphite/80 px-2 py-1 text-[10px] font-bold text-white">
                      Draft
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm font-bold text-neutral-espresso line-clamp-1">
                      {p.nama}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-neutral-slate line-clamp-2">
                    {p.deskripsiSingkat}
                  </p>
                  <div className="mt-3 flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditing(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <ProgramFormModal
          program={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ProgramFormModal({
  program,
  onClose,
}: {
  program: ProgramItem | null;
  onClose: () => void;
}) {
  const [nama, setNama] = useState(program?.nama ?? "");
  const [deskripsiSingkat, setDeskripsiSingkat] = useState(program?.deskripsiSingkat ?? "");
  const [deskripsiLengkap, setDeskripsiLengkap] = useState(program?.deskripsiLengkap ?? "");
  const [realisasiText, setRealisasiText] = useState(program?.realisasiText ?? "");
  const [impactUtama, setImpactUtama] = useState(program?.impactUtama ?? "");
  const [impactSatu, setImpactSatu] = useState(program?.impactSatu ?? "");
  const [impactDua, setImpactDua] = useState(program?.impactDua ?? "");
  const [impactTiga, setImpactTiga] = useState(program?.impactTiga ?? "");
  const [subImages, setSubImages] = useState(program?.subImages ?? []);
  const [deletedSubImageIds, setDeletedSubImageIds] = useState<string[]>([]);
  const [icon, setIcon] = useState(program?.icon ?? "Sparkles");
  const [urutan, setUrutan] = useState(program?.urutan ?? 0);
  const [isPublished, setIsPublished] = useState(program?.isPublished ?? true);
  const [preview, setPreview] = useState<string | null>(program?.fotoUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subImageInputRef = useRef<HTMLInputElement>(null);
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
      if (program) formData.append("id", program.id);
      formData.append("nama", nama);
      formData.append("deskripsiSingkat", deskripsiSingkat);
      formData.append("deskripsiLengkap", deskripsiLengkap);
      formData.append("realisasiText", realisasiText);
      formData.append("impactUtama", impactUtama);
      formData.append("impactSatu", impactSatu);
      formData.append("impactDua", impactDua);
      formData.append("impactTiga", impactTiga);
      formData.append("icon", icon);
      formData.append("urutan", String(urutan));
      formData.append("isPublished", String(isPublished));
      if (program?.fotoUrl) formData.append("existingFotoUrl", program.fotoUrl);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("foto", fileInputRef.current.files[0]);
      }
      const subImageFiles = subImageInputRef.current?.files;
      if (subImageFiles) {
        Array.from(subImageFiles).forEach((file) => formData.append("subImages", file));
      }
      deletedSubImageIds.forEach((imageId) => formData.append("deletedSubImageIds", imageId));

      await upsertProgram(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan program.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {program ? "Edit Program Unggulan" : "Tambah Program Unggulan"}
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
              Foto Kegiatan (tampil saat card diklik)
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
            <label className="text-sm font-semibold text-neutral-espresso">Nama Program</label>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Deskripsi Singkat (opsional, tidak tampil di card lagi tapi tersimpan)
            </label>
            <input
              required
              value={deskripsiSingkat}
              onChange={(e) => setDeskripsiSingkat(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Deskripsi Lengkap (tampil saat card diklik)
            </label>
            <textarea
              rows={4}
              value={deskripsiLengkap}
              onChange={(e) => setDeskripsiLengkap(e.target.value)}
              placeholder="Kosongkan untuk pakai deskripsi singkat"
              className="input-field mt-1.5 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Contoh/Realisasi Kegiatan (tampil di gambar utama)
            </label>
            <textarea
              rows={2}
              value={realisasiText}
              onChange={(e) => setRealisasiText(e.target.value)}
              placeholder="Contoh: Kegiatan literasi pagi, pojok baca, dan kunjungan perpustakaan."
              className="input-field mt-1.5 resize-none"
            />
          </div>

          <div className="rounded-2xl bg-primary-teal/5 p-4">
            <h3 className="text-sm font-bold text-neutral-espresso">Impact ke Siswa</h3>
            <div className="mt-3 space-y-3">
              <input
                value={impactUtama}
                onChange={(e) => setImpactUtama(e.target.value)}
                placeholder="Impact utama dalam satu baris"
                className="input-field"
              />
              <input
                value={impactSatu}
                onChange={(e) => setImpactSatu(e.target.value)}
                placeholder="Sub impact 1"
                className="input-field"
              />
              <input
                value={impactDua}
                onChange={(e) => setImpactDua(e.target.value)}
                placeholder="Sub impact 2"
                className="input-field"
              />
              <input
                value={impactTiga}
                onChange={(e) => setImpactTiga(e.target.value)}
                placeholder="Sub impact 3"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Subgambar Kegiatan (bisa pilih beberapa)
            </label>
            {subImages.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {subImages.map((image) => (
                  <div key={image.id} className="relative aspect-square overflow-hidden rounded-xl">
                    <Image src={image.url} alt="" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      aria-label="Hapus subgambar"
                      onClick={() => {
                        setSubImages((current) => current.filter((item) => item.id !== image.id));
                        if (!image.id.startsWith("new-")) {
                          setDeletedSubImageIds((current) => [...current, image.id]);
                        }
                      }}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={subImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="mt-2 text-xs"
            />
            <p className="mt-1 text-xs text-neutral-slate">
              Gambar baru akan ditambahkan ke subgambar yang sudah ada.
            </p>
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
