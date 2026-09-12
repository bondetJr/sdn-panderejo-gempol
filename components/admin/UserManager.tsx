"use client";

import { useState } from "react";
import { Plus, X, Loader2, Pencil, Trash2, KeyRound, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  upsertUser,
  resetUserPassword,
  deleteUser,
  type UserInput,
} from "@/lib/actions/pengaturan-admin";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "KEPALA_SEKOLAH" | "OPERATOR" | "GURU";
  isActive: boolean;
  teacher: { id: string; nama: string } | null;
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  KEPALA_SEKOLAH: "Kepala Sekolah",
  OPERATOR: "Operator",
  GURU: "Guru",
};

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-neutral-graphite text-white",
  KEPALA_SEKOLAH: "bg-joy-butter text-neutral-espresso",
  OPERATOR: "bg-sky-50 text-sky-700",
  GURU: "bg-primary-teal/10 text-primary-teal-deep",
};

export function UserManager({
  users,
  currentUserId,
}: {
  users: UserItem[];
  currentUserId: string;
}) {
  const [editing, setEditing] = useState<UserItem | null | "new">(null);
  const [resettingFor, setResettingFor] = useState<UserItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus akun ini? Tindakan tidak dapat dibatalkan.")) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus akun.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-neutral-slate">
          <ShieldCheck className="h-3.5 w-3.5 text-primary-teal" />
          Halaman ini hanya dapat diakses oleh Super Admin.
        </p>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 rounded-button bg-primary-teal px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </button>
      </div>

      <div className="overflow-hidden rounded-card bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-espresso/10 bg-neutral-espresso/[0.03] text-xs font-bold uppercase tracking-wide text-neutral-slate">
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-espresso/5 last:border-0 hover:bg-primary-teal/5">
                  <td className="px-5 py-3 font-medium text-neutral-espresso">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-1.5 text-[10px] text-neutral-slate">(Anda)</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-neutral-slate">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", ROLE_BADGE[u.role])}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        u.isActive ? "bg-primary-teal/10 text-primary-teal-deep" : "bg-red-50 text-red-600"
                      )}
                    >
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setResettingFor(u)}
                        className="flex h-8 w-8 items-center justify-center rounded-button bg-amber-50 text-amber-700 hover:bg-amber-100"
                        title="Reset Password"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(u)}
                        className="flex h-8 w-8 items-center justify-center rounded-button bg-primary-teal-deep/10 text-primary-teal-deep hover:bg-primary-teal-deep/20"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === u.id || u.id === currentUserId}
                        onClick={() => handleDelete(u.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-button bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-30"
                      >
                        {deletingId === u.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <UserFormModal user={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}

      {resettingFor && (
        <ResetPasswordModal user={resettingFor} onClose={() => setResettingFor(null)} />
      )}
    </div>
  );
}

function UserFormModal({
  user,
  onClose,
}: {
  user: UserItem | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserInput["role"]>(user?.role ?? "OPERATOR");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await upsertUser({
        id: user?.id,
        name,
        email,
        role,
        isActive,
        password: password || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan akun.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">
            {user ? "Edit Pengguna" : "Tambah Pengguna Baru"}
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
            <label className="text-sm font-semibold text-neutral-espresso">Nama</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Email</label>
            <input
              required
              type="email"
              disabled={!!user}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field mt-1.5 disabled:opacity-60"
            />
            {user && (
              <p className="mt-1 text-[11px] text-neutral-slate">
                Email tidak dapat diubah setelah akun dibuat.
              </p>
            )}
          </div>

          {!user && (
            <div>
              <label className="text-sm font-semibold text-neutral-espresso">
                Password (min. 8 karakter)
              </label>
              <input
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-neutral-espresso">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserInput["role"])}
              className="input-field mt-1.5"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="KEPALA_SEKOLAH">Kepala Sekolah</option>
              <option value="OPERATOR">Operator</option>
              <option value="GURU">Guru</option>
            </select>
          </div>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-espresso/30 text-primary-teal focus:ring-primary-teal"
            />
            <span className="text-sm text-neutral-espresso/80">Akun aktif (bisa login)</span>
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

function ResetPasswordModal({
  user,
  onClose,
}: {
  user: UserItem;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await resetUserPassword(user.id, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-espresso">Reset Password</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-espresso/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-slate">
          Untuk akun: <strong>{user.name}</strong> ({user.email})
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Password Baru (min. 8 karakter)
            </label>
            <input
              required
              minLength={8}
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
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
