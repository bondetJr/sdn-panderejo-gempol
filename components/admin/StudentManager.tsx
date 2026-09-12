"use client";

import { useState } from "react";
import { Plus, X, Loader2, Pencil, Trash2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertStudent, deleteStudent, type StudentInput } from "@/lib/actions/siswa-admin";

type StudentItem = {
  id: string;
  nama: string;
  nis: string | null;
  nisn: string | null;
  nik: string | null;
  jenisKelamin: "L" | "P" | null;
  isActive: boolean;
};

export function StudentManager({
  classRoomId,
  students,
}: {
  classRoomId: string;
  students: StudentItem[];
}) {
  const [editing, setEditing] = useState<StudentItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus data siswa ini?")) return;
    setDeletingId(id);
    try {
      await deleteStudent(id, classRoomId);
    } finally {
      setDeletingId(null);
    }
  }

  const aktifCount = students.filter((s) => s.isActive).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm text-neutral-slate">
          <UserRound className="h-4 w-4 text-primary-teal" />
          {aktifCount} siswa aktif dari total {students.length} data
        </p>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 rounded-button bg-primary-teal px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Tambah Siswa
        </button>
      </div>

      <div className="overflow-hidden rounded-card bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-espresso/10 bg-neutral-espresso/[0.03] text-xs font-bold uppercase tracking-wide text-neutral-slate">
                <th className="px-5 py-3 w-12">No</th>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">No. Induk</th>
                <th className="px-5 py-3">NISN</th>
                <th className="px-5 py-3">L/P</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-neutral-slate">
                    Belum ada data siswa di rombel ini.
                  </td>
                </tr>
              ) : (
                students.map((s, idx) => (
                  <tr key={s.id} className="border-b border-neutral-espresso/5 last:border-0 hover:bg-primary-teal/5">
                    <td className="px-5 py-3 text-neutral-slate">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium text-neutral-espresso">{s.nama}</td>
                    <td className="px-5 py-3 text-neutral-slate">{s.nis ?? "-"}</td>
                    <td className="px-5 py-3 text-neutral-slate">{s.nisn ?? "-"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-bold",
                          s.jenisKelamin === "L" ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700"
                        )}
                      >
                        {s.jenisKelamin ?? "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-bold",
                          s.isActive ? "bg-primary-teal/10 text-primary-teal-deep" : "bg-neutral-slate/10 text-neutral-slate"
                        )}
                      >
                        {s.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditing(s)}
                          className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === s.id}
                          onClick={() => handleDelete(s.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          {deletingId === s.id ? (
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
        <StudentFormModal
          classRoomId={classRoomId}
          student={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function StudentFormModal({
  classRoomId,
  student,
  onClose,
}: {
  classRoomId: string;
  student: StudentItem | null;
  onClose: () => void;
}) {
  const [nama, setNama] = useState(student?.nama ?? "");
  const [nis, setNis] = useState(student?.nis ?? "");
  const [nisn, setNisn] = useState(student?.nisn ?? "");
  const [nik, setNik] = useState(student?.nik ?? "");
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">(student?.jenisKelamin ?? "L");
  const [isActive, setIsActive] = useState(student?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input: StudentInput = {
        id: student?.id,
        classRoomId,
        nama,
        nis,
        nisn,
        nik,
        jenisKelamin,
        isActive,
      };
      await upsertStudent(input);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data siswa.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {student ? "Edit Data Siswa" : "Tambah Siswa"}
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
              <label className="text-sm font-semibold text-neutral-espresso">No. Induk</label>
              <input
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">NISN</label>
              <input
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                maxLength={10}
                inputMode="numeric"
                placeholder="10 digit"
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              NIK (opsional, tidak tampil publik)
            </label>
            <input
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              maxLength={16}
              inputMode="numeric"
              placeholder="16 digit"
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Jenis Kelamin</label>
            <div className="mt-1.5 flex gap-3">
              {(["L", "P"] as const).map((jk) => (
                <label
                  key={jk}
                  className={cn(
                    "flex-1 cursor-pointer rounded-button border-2 px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                    jenisKelamin === jk
                      ? "border-primary-teal bg-primary-teal/5 text-primary-teal-deep"
                      : "border-neutral-espresso/10 text-neutral-slate"
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    checked={jenisKelamin === jk}
                    onChange={() => setJenisKelamin(jk)}
                  />
                  {jk === "L" ? "Laki-laki" : "Perempuan"}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-espresso/30 text-primary-teal focus:ring-primary-teal"
            />
            <span className="text-sm text-neutral-espresso/80">
              Siswa aktif (dihitung di ringkasan publik)
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
