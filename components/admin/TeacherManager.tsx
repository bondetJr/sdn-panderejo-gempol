"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Plus, X, Loader2, Pencil, Trash2, ImageOff, User, KeyRound, CheckCircle2, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertTeacher, deleteTeacher, createLoginForTeacher } from "@/lib/actions/guru-admin";

type TeacherItem = {
  id: string;
  nama: string;
  nip: string | null;
  nuptk: string | null;
  jabatan: string;
  statusKepegawaian: "PNS" | "PPPK" | "HONORER";
  jenisKelamin: "L" | "P" | null;
  mapelDiampu: string | null;
  fotoUrl: string | null;
  isActive: boolean;
  isKepalaSekolah: boolean;
  urutan: number;
  user: { id: string; email: string; isActive: boolean } | null;
};

const STATUS_BADGE: Record<string, string> = {
  PNS: "bg-primary-teal/10 text-primary-teal-deep",
  PPPK: "bg-sky-50 text-sky-700",
  HONORER: "bg-amber-50 text-amber-700",
};

export function TeacherManager({ teachers }: { teachers: TeacherItem[] }) {
  const [editing, setEditing] = useState<TeacherItem | null | "new">(null);
  const [creatingLoginFor, setCreatingLoginFor] = useState<TeacherItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus data guru ini? Akun login terkait (jika ada) juga perlu dihapus manual.")) return;
    setDeletingId(id);
    try {
      await deleteTeacher(id);
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
          Tambah Guru/Tendik
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teachers.length === 0 ? (
          <div className="col-span-full rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
            Belum ada data guru/tendik.
          </div>
        ) : (
          teachers.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-card bg-white shadow-soft">
              <div className="relative aspect-square bg-primary-teal/10">
                {t.fotoUrl ? (
                  <Image src={t.fotoUrl} alt={t.nama} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary-teal-deep">
                    <User className="h-14 w-14" strokeWidth={1.2} />
                  </div>
                )}
                {t.isKepalaSekolah && (
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-joy-butter px-2 py-1 text-[10px] font-bold text-neutral-espresso">
                    <Crown className="h-3 w-3" />
                    Kepsek
                  </span>
                )}
                <span
                  className={cn(
                    "absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold",
                    STATUS_BADGE[t.statusKepegawaian]
                  )}
                >
                  {t.statusKepegawaian}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold leading-snug text-neutral-espresso line-clamp-2">
                  {t.nama}
                </p>
                <p className="text-xs text-primary-teal-deep">{t.jabatan}</p>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
                  {t.user ? (
                    <span className="flex items-center gap-1 text-primary-teal-deep">
                      <CheckCircle2 className="h-3 w-3" />
                      Punya akun ({t.user.email})
                    </span>
                  ) : (
                    <span className="text-neutral-slate">Belum ada akun login</span>
                  )}
                </div>

                <div className="mt-3 flex justify-between gap-1.5">
                  {!t.user && (
                    <button
                      type="button"
                      onClick={() => setCreatingLoginFor(t)}
                      className="flex items-center gap-1 rounded-button bg-primary-teal-deep/10 px-2.5 py-1.5 text-[11px] font-bold text-primary-teal-deep hover:bg-primary-teal-deep/20"
                    >
                      <KeyRound className="h-3 w-3" />
                      Buat Akun
                    </button>
                  )}
                  <div className="ml-auto flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditing(t)}
                      className="flex h-7 w-7 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === t.id}
                      onClick={() => handleDelete(t.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      {deletingId === t.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <TeacherFormModal teacher={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}

      {creatingLoginFor && (
        <CreateLoginModal teacher={creatingLoginFor} onClose={() => setCreatingLoginFor(null)} />
      )}
    </div>
  );
}

function TeacherFormModal({
  teacher,
  onClose,
}: {
  teacher: TeacherItem | null;
  onClose: () => void;
}) {
  const [nama, setNama] = useState(teacher?.nama ?? "");
  const [nip, setNip] = useState(teacher?.nip ?? "");
  const [nuptk, setNuptk] = useState(teacher?.nuptk ?? "");
  const [jabatan, setJabatan] = useState(teacher?.jabatan ?? "");
  const [statusKepegawaian, setStatusKepegawaian] = useState(
    teacher?.statusKepegawaian ?? "HONORER"
  );
  const [jenisKelamin, setJenisKelamin] = useState(teacher?.jenisKelamin ?? "");
  const [mapelDiampu, setMapelDiampu] = useState(teacher?.mapelDiampu ?? "");
  const [isActive, setIsActive] = useState(teacher?.isActive ?? true);
  const [urutan, setUrutan] = useState(teacher?.urutan ?? 0);
  const [preview, setPreview] = useState<string | null>(teacher?.fotoUrl ?? null);
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
      if (teacher) formData.append("id", teacher.id);
      formData.append("nama", nama);
      formData.append("nip", nip);
      formData.append("nuptk", nuptk);
      formData.append("jabatan", jabatan);
      formData.append("statusKepegawaian", statusKepegawaian);
      formData.append("jenisKelamin", jenisKelamin);
      formData.append("mapelDiampu", mapelDiampu);
      formData.append("isActive", String(isActive));
      formData.append("urutan", String(urutan));
      if (teacher?.fotoUrl) formData.append("existingFotoUrl", teacher.fotoUrl);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("foto", fileInputRef.current.files[0]);
      }

      await upsertTeacher(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {teacher ? "Edit Data Guru/Tendik" : "Tambah Guru/Tendik"}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">NIP</label>
              <input value={nip} onChange={(e) => setNip(e.target.value)} className="input-field mt-1.5" />
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Jenis Kelamin
              </label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as "" | "L" | "P")}
                className="input-field mt-1.5"
              >
                <option value="">Belum dipilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">NUPTK</label>
              <input value={nuptk} onChange={(e) => setNuptk(e.target.value)} className="input-field mt-1.5" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Jabatan</label>
            <input
              required
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Contoh: Guru Kelas 3, Guru PJOK, Operator Sekolah"
              className="input-field mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Status Kepegawaian
              </label>
              <select
                value={statusKepegawaian}
                onChange={(e) =>
                  setStatusKepegawaian(e.target.value as TeacherItem["statusKepegawaian"])
                }
                className="input-field mt-1.5"
              >
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="HONORER">Honorer</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Mapel Diampu
              </label>
              <input
                value={mapelDiampu}
                onChange={(e) => setMapelDiampu(e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Urutan Tampil di Halaman Publik
            </label>
            <input
              type="number"
              value={urutan}
              onChange={(e) => setUrutan(Number(e.target.value))}
              className="input-field mt-1.5 max-w-[140px]"
            />
            <p className="mt-1 text-[11px] text-neutral-slate">
              Angka lebih kecil tampil lebih dulu. Contoh: Kepala Sekolah = 0, guru kelas 1 = 10, dst.
            </p>
          </div>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-espresso/30 text-primary-teal focus:ring-primary-teal"
            />
            <span className="text-sm text-neutral-espresso/80">Status aktif</span>
          </label>

          <p className="text-xs text-neutral-slate">
            Untuk mengatur status Kepala Sekolah &amp; teks sambutan, gunakan menu{" "}
            <strong>Profil Manager &gt; Sambutan Kepsek</strong>.
          </p>

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

function CreateLoginModal({
  teacher,
  onClose,
}: {
  teacher: TeacherItem;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createLoginForTeacher(teacher.id, email, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat akun.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            Buat Akun Login
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-espresso/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-slate">
          Untuk: <strong>{teacher.nama}</strong> — role otomatis{" "}
          {teacher.isKepalaSekolah ? "Kepala Sekolah" : "Guru"}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Password (min. 8 karakter)
            </label>
            <input
              required
              minLength={8}
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-1.5"
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
              Buat Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
