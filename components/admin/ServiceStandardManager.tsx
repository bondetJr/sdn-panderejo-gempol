"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Plus,
  X,
  Loader2,
  Pencil,
  Trash2,
  ImageOff,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  upsertServiceStandard,
  deleteServiceStandard,
} from "@/lib/actions/layanan-admin";

export type ServiceStandardRow = {
  id: string;
  nama: string;
  coverImage: string | null;
  deskripsi: string;
  persyaratan: string;
  mekanismeImage: string | null;
  mekanismeText: string | null;
  waktuPelayanan: string | null;
  biaya: string | null;
  produkLayanan: string | null;
  pengaduan: string | null;
  documentFile: string | null;
  documentName: string | null;
  urutan: number;
  isPublished: boolean;
};

export function ServiceStandardManager({ items }: { items: ServiceStandardRow[] }) {
  const [editing, setEditing] = useState<ServiceStandardRow | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus standar pelayanan ini?")) return;
    setDeletingId(id);
    try {
      await deleteServiceStandard(id);
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
          Tambah Layanan
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
          Belum ada data standar pelayanan.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-card bg-white shadow-soft">
              <div className="relative flex h-32 items-center justify-center bg-primary-teal/10">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.nama}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <ImageOff className="h-8 w-8 text-primary-teal-deep/40" />
                )}
                {!item.isPublished && (
                  <span className="absolute left-2 top-2 rounded-full bg-neutral-graphite/80 px-2 py-1 text-[10px] font-bold text-white">
                    Draft
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-neutral-espresso line-clamp-1">
                  {item.nama}
                </p>
                <p className="mt-1 text-xs text-neutral-slate line-clamp-2">
                  {item.deskripsi}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-slate">
                  <FileText className="h-3.5 w-3.5 text-primary-teal" />
                  {item.documentFile ? "Dokumen tersedia" : "Belum ada dokumen"}
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
        <ServiceStandardFormModal
          item={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ServiceStandardFormModal({
  item,
  onClose,
}: {
  item: ServiceStandardRow | null;
  onClose: () => void;
}) {
  const [nama, setNama] = useState(item?.nama ?? "");
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
  const [mekanismePreview, setMekanismePreview] = useState<string | null>(
    item?.mekanismeImage ?? null
  );
  const coverInputRef = useRef<HTMLInputElement>(null);
  const mekanismeInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (item) formData.append("id", item.id);
      formData.append("nama", nama);
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
      if (item?.documentName) formData.append("existingDocumentName", item.documentName);

      if (coverInputRef.current?.files?.[0]) {
        formData.append("coverImage", coverInputRef.current.files[0]);
      }
      if (mekanismeInputRef.current?.files?.[0]) {
        formData.append("mekanismeImage", mekanismeInputRef.current.files[0]);
      }
      if (documentInputRef.current?.files?.[0]) {
        formData.append("documentFile", documentInputRef.current.files[0]);
      }

      await upsertServiceStandard(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {item ? "Edit Standar Pelayanan" : "Tambah Standar Pelayanan"}
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
            <label className="text-sm font-semibold text-neutral-espresso">Nama Layanan</label>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Layanan Mutasi Siswa"
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Cover</label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-espresso/5">
                {coverPreview ? (
                  <Image src={coverPreview} alt="Preview cover" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-5 w-5 text-neutral-slate/40" />
                  </div>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCoverPreview(URL.createObjectURL(file));
                }}
                className="text-xs"
              />
            </div>
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

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Persyaratan (satu baris = satu syarat)
            </label>
            <textarea
              required
              rows={4}
              value={persyaratan}
              onChange={(e) => setPersyaratan(e.target.value)}
              placeholder={"Fotokopi Kartu Keluarga\nAkta Kelahiran\nSurat keterangan pindah"}
              className="input-field mt-1.5 resize-none"
            />
          </div>

          <div className="rounded-2xl bg-primary-teal/5 p-4">
            <h3 className="text-sm font-bold text-neutral-espresso">Mekanisme & Prosedur</h3>
            <div className="mt-3 flex items-center gap-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-white">
                {mekanismePreview ? (
                  <Image
                    src={mekanismePreview}
                    alt="Preview mekanisme"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-5 w-5 text-neutral-slate/40" />
                  </div>
                )}
              </div>
              <input
                ref={mekanismeInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setMekanismePreview(URL.createObjectURL(file));
                }}
                className="text-xs"
              />
            </div>
            <textarea
              rows={4}
              value={mekanismeText}
              onChange={(e) => setMekanismeText(e.target.value)}
              placeholder={"Pemohon mengajukan permohonan\nOperator memverifikasi berkas\nKepala sekolah menandatangani"}
              className="input-field mt-3 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Waktu Pelayanan</label>
              <input
                value={waktuPelayanan}
                onChange={(e) => setWaktuPelayanan(e.target.value)}
                placeholder="Contoh: 3 hari kerja"
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Biaya</label>
              <input
                value={biaya}
                onChange={(e) => setBiaya(e.target.value)}
                placeholder="Contoh: Gratis / Tidak dipungut biaya"
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Produk Layanan</label>
            <textarea
              rows={2}
              value={produkLayanan}
              onChange={(e) => setProdukLayanan(e.target.value)}
              placeholder="Contoh: Surat Keterangan Pindah Sekolah"
              className="input-field mt-1.5 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Pengaduan & Saran
            </label>
            <textarea
              rows={2}
              value={pengaduan}
              onChange={(e) => setPengaduan(e.target.value)}
              placeholder="Contoh: Telepon 0343-xxxx / kotak saran di ruang TU"
              className="input-field mt-1.5 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Dokumen (PDF/DOC/DOCX, maks 10 MB)
            </label>
            <input
              ref={documentInputRef}
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="mt-1.5 block text-xs"
            />
            {item?.documentFile && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-slate">
                <FileText className="h-3.5 w-3.5 text-primary-teal" />
                Dokumen saat ini: {item.documentName ?? "dokumen"}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 items-end gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Urutan</label>
              <input
                type="number"
                value={urutan}
                onChange={(e) => setUrutan(Number(e.target.value))}
                className="input-field mt-1.5"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsPublished((v) => !v)}
              className="flex h-11 items-center gap-2 text-sm font-semibold text-neutral-espresso"
            >
              {isPublished ? (
                <Eye className="h-4 w-4 text-primary-teal" />
              ) : (
                <EyeOff className="h-4 w-4 text-neutral-slate" />
              )}
              {isPublished ? "Tampil di halaman publik" : "Draft (tidak tampil publik)"}
            </button>
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
