"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, Loader2, Pencil, Trash2, Users2 } from "lucide-react";
import { upsertClassRoom, deleteClassRoom, type ClassRoomInput } from "@/lib/actions/akademik-admin";

type ClassRoomItem = {
  id: string;
  nama: string;
  tingkat: number;
  tahunAjaran: string;
  waliKelasId: string | null;
  waliKelas: { id: string; nama: string } | null;
  _count: { students: number };
};

type TeacherOption = { id: string; nama: string };

export function ClassRoomManager({
  classRooms,
  teachers,
}: {
  classRooms: ClassRoomItem[];
  teachers: TeacherOption[];
}) {
  const [editing, setEditing] = useState<ClassRoomItem | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus rombel ini? Data siswa yang terhubung tidak akan terhapus otomatis.")) return;
    setDeletingId(id);
    try {
      await deleteClassRoom(id);
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
          Tambah Rombel
        </button>
      </div>

      <div className="overflow-hidden rounded-card bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-espresso/10 bg-neutral-espresso/[0.03] text-xs font-bold uppercase tracking-wide text-neutral-slate">
                <th className="px-5 py-3">Kelas</th>
                <th className="px-5 py-3">Tahun Ajaran</th>
                <th className="px-5 py-3">Wali Kelas</th>
                <th className="px-5 py-3">Jml Siswa</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {classRooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-neutral-slate">
                    Belum ada rombel.
                  </td>
                </tr>
              ) : (
                classRooms.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-espresso/5 last:border-0 hover:bg-primary-teal/5">
                    <td className="px-5 py-3 font-bold text-neutral-espresso">{c.nama}</td>
                    <td className="px-5 py-3 text-neutral-slate">{c.tahunAjaran}</td>
                    <td className="px-5 py-3 text-neutral-slate">
                      {c.waliKelas?.nama ?? "-"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-neutral-slate">
                        <Users2 className="h-3.5 w-3.5" />
                        {c._count.students}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/admin/akademik/rombel/${c.id}`}
                          className="flex items-center gap-1 rounded-button bg-primary-teal px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                        >
                          <Users2 className="h-3.5 w-3.5" />
                          Kelola Siswa
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditing(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === c.id}
                          onClick={() => handleDelete(c.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          {deletingId === c.id ? (
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
        <ClassRoomFormModal
          classRoom={editing === "new" ? null : editing}
          teachers={teachers}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ClassRoomFormModal({
  classRoom,
  teachers,
  onClose,
}: {
  classRoom: ClassRoomItem | null;
  teachers: TeacherOption[];
  onClose: () => void;
}) {
  const [nama, setNama] = useState(classRoom?.nama ?? "");
  const [tingkat, setTingkat] = useState(classRoom?.tingkat ?? 1);
  const [tahunAjaran, setTahunAjaran] = useState(classRoom?.tahunAjaran ?? "2026/2027");
  const [waliKelasId, setWaliKelasId] = useState(classRoom?.waliKelasId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input: ClassRoomInput = {
        id: classRoom?.id,
        nama,
        tingkat,
        tahunAjaran,
        waliKelasId: waliKelasId || undefined,
      };
      await upsertClassRoom(input);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan rombel.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {classRoom ? "Edit Rombel" : "Tambah Rombel"}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Nama Kelas
              </label>
              <input
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: 1A"
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">Tingkat</label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(Number(e.target.value))}
                className="input-field mt-1.5"
              >
                {[1, 2, 3, 4, 5, 6].map((t) => (
                  <option key={t} value={t}>
                    Kelas {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Tahun Ajaran
            </label>
            <input
              required
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Wali Kelas
            </label>
            <select
              value={waliKelasId}
              onChange={(e) => setWaliKelasId(e.target.value)}
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
