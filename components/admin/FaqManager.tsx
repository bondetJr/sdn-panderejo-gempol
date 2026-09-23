"use client";

import { useState } from "react";
import { Loader2, Plus, Pencil, Trash2, HelpCircle, Save, X } from "lucide-react";
import { createFaq, updateFaq, deleteFaq } from "@/lib/actions/kontak-admin";

type FaqItem = {
  id: string;
  pertanyaan: string;
  jawaban: string;
  urutan: number;
  createdAt: Date;
};

export function FaqManager({ faqs: initialFaqs }: { faqs: FaqItem[] }) {
  const [faqs] = useState(initialFaqs);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ pertanyaan: "", jawaban: "", urutan: 0 });

  function openCreate() {
    setFormData({ pertanyaan: "", jawaban: "", urutan: faqs.length });
    setEditingId(null);
    setIsFormOpen(true);
  }

  function openEdit(faq: FaqItem) {
    setFormData({ pertanyaan: faq.pertanyaan, jawaban: faq.jawaban, urutan: faq.urutan });
    setEditingId(faq.id);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ pertanyaan: "", jawaban: "", urutan: 0 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.pertanyaan.trim() || !formData.jawaban.trim()) {
      alert("Pertanyaan dan jawaban wajib diisi!");
      return;
    }

    setBusyId("form");
    try {
      if (editingId) {
        const res = await updateFaq(editingId, formData);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createFaq(formData);
        if (!res.success) throw new Error(res.error);
      }
      closeForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan FAQ";
      alert(message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus FAQ ini? Tindakan tidak bisa dibatalkan.")) return;
    setBusyId(id);
    try {
      await deleteFaq(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus FAQ";
      alert(message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header + Tombol Tambah */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-slate">
            Total {faqs.length} FAQ. Urutan menentukan posisi di halaman publik.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-button bg-primary-teal px-4 py-2 text-sm font-bold text-white shadow-soft hover:bg-primary-teal-deep"
        >
          <Plus className="h-4 w-4" />
          Tambah FAQ
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-espresso">
                {editingId ? "Edit FAQ" : "Tambah FAQ Baru"}
              </h3>
              <button onClick={closeForm} className="rounded-full p-1 hover:bg-neutral-espresso/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-espresso">
                  Pertanyaan
                </label>
                <input
                  type="text"
                  value={formData.pertanyaan}
                  onChange={(e) => setFormData({ ...formData, pertanyaan: e.target.value })}
                  placeholder="Contoh: Bagaimana cara mendaftar PPDB?"
                  className="w-full rounded-button border border-neutral-espresso/20 px-3 py-2 text-sm focus:border-primary-teal focus:outline-none focus:ring-1 focus:ring-primary-teal"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-espresso">
                  Jawaban
                </label>
                <textarea
                  value={formData.jawaban}
                  onChange={(e) => setFormData({ ...formData, jawaban: e.target.value })}
                  placeholder="Jawaban lengkap untuk pertanyaan di atas..."
                  rows={4}
                  className="w-full rounded-button border border-neutral-espresso/20 px-3 py-2 text-sm focus:border-primary-teal focus:outline-none focus:ring-1 focus:ring-primary-teal"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-espresso">
                  Urutan (opsional, angka kecil = tampil paling atas)
                </label>
                <input
                  type="number"
                  value={formData.urutan}
                  onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-button border border-neutral-espresso/20 px-3 py-2 text-sm focus:border-primary-teal focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-button bg-neutral-espresso/10 px-4 py-2 text-sm font-bold text-neutral-espresso hover:bg-neutral-espresso/20"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busyId === "form"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-button bg-primary-teal px-4 py-2 text-sm font-bold text-white hover:bg-primary-teal-deep disabled:opacity-50"
                >
                  {busyId === "form" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List FAQ */}
      {faqs.length === 0 ? (
        <div className="rounded-card bg-white p-10 text-center shadow-soft">
          <HelpCircle className="mx-auto mb-3 h-10 w-10 text-neutral-slate/50" />
          <p className="text-sm font-semibold text-neutral-espresso">Belum ada FAQ</p>
          <p className="mt-1 text-xs text-neutral-slate">Klik &quot;Tambah FAQ&quot; untuk membuat FAQ pertama.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="group rounded-card bg-white p-5 shadow-soft transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-[11px] font-bold text-primary-teal-deep">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-neutral-espresso">{faq.pertanyaan}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-espresso/70">{faq.jawaban}</p>
                  <p className="mt-2 text-[11px] text-neutral-slate">Urutan: {faq.urutan}</p>
                </div>
                <div className="flex shrink-0 gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(faq)}
                    disabled={busyId === faq.id}
                    className="rounded-button bg-primary-teal/10 p-2 text-primary-teal-deep hover:bg-primary-teal/20"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    disabled={busyId === faq.id}
                    className="rounded-button bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                    title="Hapus"
                  >
                    {busyId === faq.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
