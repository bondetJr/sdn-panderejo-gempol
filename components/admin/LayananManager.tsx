"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Download, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteServiceStandard, upsertServiceStandard } from "@/lib/actions/layanan-admin";

export type ServiceStandardAdminItem = {
  id: string;
  judul: string;
  coverImage: string | null;
  deskripsi: string;
  persyaratan: string;
  mekanismeImage: string | null;
  mekanismeText: string;
  waktuPelayanan: string | null;
  biaya: string | null;
  produkLayanan: string;
  pengaduan: string;
  documentFile: string | null;
  isPublished: boolean;
  urutan: number;
};

export function LayananManager({ items }: { items: ServiceStandardAdminItem[] }) {
  const [editing, setEditing] = useState<ServiceStandardAdminItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus layanan ini?")) return;
    setDeletingId(id);
    try {
      await deleteServiceStandard(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 rounded-button bg-primary-teal px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Tambah Layanan
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
          Belum ada data layanan.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-card border border-neutral-espresso/10 bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-neutral-espresso/5 md:h-24 md:w-36">
                  {item.coverImage ? (
                    <Image src={item.coverImage} alt={item.judul} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-slate">No Image</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-neutral-espresso">{item.judul}</p>
                    {!item.isPublished && (
                      <span className="rounded-full bg-neutral-graphite/80 px-2 py-1 text-[10px] font-bold text-white">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-slate">{item.deskripsi}</p>
                </div>
                <div className="flex gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                    aria-label={`Edit ${item.judul}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                    aria-label={`Hapus ${item.judul}`}
                  >
                    {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <LayananFormModal
          item={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function LayananFormModal({ item, onClose }: { item: ServiceStandardAdminItem | null; onClose: () => void }) {
  const [judul, setJudul] = useState(item?.judul ?? "");
  const [deskripsi, setDeskripsi] = useState(item?.deskripsi ?? "");
  const [persyaratan, setPersyaratan] = useState(item?.persyaratan ?? "");
  const [mekanismeText, setMekanismeText] = useState(item?.mekanismeText ?? "");
  const [waktuPelayanan, setWaktuPelayanan] = useState(item?.waktuPelayanan ?? "");
  const [biaya, setBiaya] = useState(item?.biaya ?? "");
  const [produkLayanan, setProdukLayanan] = useState(item?.produkLayanan ?? "");
  const [pengaduan, setPengaduan] = useState(item?.pengaduan ?? "");
  const [urutan, setUrutan] = useState(item?.urutan ?? 0);
  const [isPublished, setIsPublished] = useState(item?.isPublished ?? true);
  const [coverPreview, setCoverPreview] = useState<string | null>(item?.coverImage ?? null);
  const [mekanismePreview, setMekanismePreview] = useState<string | null>(item?.mekanismeImage ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const mekanismeInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  }

  function handleMekanismeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setMekanismePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (item) formData.append("id", item.id);
      formData.append("judul", judul);
      formData.append("deskripsi", deskripsi);
      formData.append("persyaratan", persyaratan);
      formData.append("mekanismeText", mekanismeText);
      formData.append("waktuPelayanan", waktuPelayanan);
      formData.append("biaya", biaya);
      formData.append("produkLayanan", produkLayanan);
      formData.append("pengaduan", pengaduan);
      formData.append("urutan", String(urutan));
      formData.append("isPublished", String(isPublished));
      if (item?.coverImage) formData.append("existingCoverImage", item.coverImage);
      if (item?.mekanismeImage) formData.append("existingMekanismeImage", item.mekanismeImage);
      if (item?.documentFile) formData.append("existingDocumentFile", item.documentFile);
      if (coverInputRef.current?.files?.[0]) formData.append("coverImage", coverInputRef.current.files[0]);
      if (mekanismeInputRef.current?.files?.[0]) formData.append("mekanismeImage", mekanismeInputRef.current.files[0]);
      if (documentInputRef.current?.files?.[0]) formData.append("documentFile", documentInputRef.current.files[0]);

      await upsertServiceStandard(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data layanan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {item ? "Edit Layanan" : "Tambah Layanan"}
          </h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-espresso/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-neutral-espresso">Judul layanan</label>
              <input required value={judul} onChange={(e) => setJudul(e.target.value)} className="input-field mt-1.5" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-neutral-espresso">Cover image</label>
              <div className="mt-1.5 flex items-center gap-4">
                <div className="relative h-24 w-40 overflow-hidden rounded-xl bg-neutral-espresso/5">
                  {coverPreview ? (
                    <Image src={coverPreview} alt="Cover preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-slate">Preview</div>
                  )}
                </div>
                <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="text-xs" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-neutral-espresso">Deskripsi</label>
              <textarea required rows={3} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="input-field mt-1.5 resize-none" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-neutral-espresso">Persyaratan</label>
              <textarea required rows={4} value={persyaratan} onChange={(e) => setPersyaratan(e.target.value)} className="input-field mt-1.5 resize-none" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-neutral-espresso">Mekanisme</label>
              <div className="mt-1.5 flex items-center gap-4">
                <div className="relative h-20 w-32 overflow-hidden rounded-xl bg-neutral-espresso/5">
                  {mekanismePreview ? (
                    <Image src={mekanismePreview} alt="Mekanisme preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-slate">Preview</div>
                  )}
                </div>
                <input ref={mekanismeInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleMekanismeChange} className="text-xs" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-neutral-espresso">Keterangan mekanisme</label>
              <textarea required rows={4} value={mekanismeText} onChange={(e) => setMekanismeText(e.target.value)} className="input-field mt-1.5 resize-none" />
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Waktu pelayanan</label>
              <input value={waktuPelayanan} onChange={(e) => setWaktuPelayanan(e.target.value)} className="input-field mt-1.5" />
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Biaya</label>
              <input value={biaya} onChange={(e) => setBiaya(e.target.value)} className="input-field mt-1.5" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-neutral-espresso">Produk layanan</label>
              <textarea required rows={3} value={produkLayanan} onChange={(e) => setProdukLayanan(e.target.value)} className="input-field mt-1.5 resize-none" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-neutral-espresso">Pengaduan</label>
              <textarea required rows={3} value={pengaduan} onChange={(e) => setPengaduan(e.target.value)} className="input-field mt-1.5 resize-none" />
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Urutan</label>
              <input type="number" value={urutan} onChange={(e) => setUrutan(Number(e.target.value))} className="input-field mt-1.5" />
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Status</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-button border border-neutral-espresso/10 bg-neutral-espresso/5 px-3 py-2">
                <button type="button" onClick={() => setIsPublished(true)} className={`flex items-center gap-2 rounded-button px-2 py-1 text-xs font-semibold ${isPublished ? "bg-primary-teal text-white" : "text-neutral-slate"}`}>
                  <Eye className="h-3.5 w-3.5" /> Publikasikan
                </button>
                <button type="button" onClick={() => setIsPublished(false)} className={`flex items-center gap-2 rounded-button px-2 py-1 text-xs font-semibold ${!isPublished ? "bg-neutral-graphite text-white" : "text-neutral-slate"}`}>
                  <EyeOff className="h-3.5 w-3.5" /> Draft
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-neutral-espresso">Dokumen pendukung (opsional)</label>
              <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx" className="mt-1.5 text-xs" />
              {item?.documentFile && (
                <a href={item.documentFile} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-primary-teal-deep hover:underline">
                  <Download className="h-3.5 w-3.5" /> Download dokumen saat ini
                </a>
              )}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-button border border-neutral-espresso/10 px-4 py-2 text-sm font-semibold text-neutral-espresso hover:bg-neutral-espresso/5">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="rounded-button bg-primary-teal px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</span> : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
