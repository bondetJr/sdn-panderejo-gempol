"use client";

import { useState } from "react";
import { Check, Loader2, Star, Trash2, X } from "lucide-react";
import { cn, formatTanggalId } from "@/lib/utils";
import {
  setTestimonialApproval,
  setTestimonialFeatured,
  deleteTestimonial,
} from "@/lib/actions/kontak-admin";

type TestimonialItem = {
  id: string;
  nama: string;
  peran: string | null;
  pesan: string;
  rating: number | null;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date;
};

export function TestimonialModeration({ testimonials }: { testimonials: TestimonialItem[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleApprove(id: string, approve: boolean) {
    setBusyId(id);
    try {
      await setTestimonialApproval(id, approve);
    } finally {
      setBusyId(null);
    }
  }

  async function handleFeatured(id: string, featured: boolean) {
    setBusyId(id);
    try {
      await setTestimonialFeatured(id, featured);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus testimoni ini?")) return;
    setBusyId(id);
    try {
      await deleteTestimonial(id);
    } finally {
      setBusyId(null);
    }
  }

  if (testimonials.length === 0) {
    return (
      <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
        Belum ada testimoni masuk.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {testimonials.map((t) => (
        <div key={t.id} className="rounded-card bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-neutral-espresso">{t.nama}</p>
              {t.peran && <p className="text-xs text-neutral-slate">{t.peran}</p>}
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold",
                t.isApproved
                  ? "bg-primary-teal/10 text-primary-teal-deep"
                  : "bg-amber-50 text-amber-700"
              )}
            >
              {t.isApproved ? "Disetujui" : "Menunggu Review"}
            </span>
          </div>

          {t.rating && (
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < t.rating! ? "fill-joy-butter text-joy-butter" : "text-neutral-espresso/15"
                  )}
                />
              ))}
            </div>
          )}

          <p className="mt-2 text-sm leading-relaxed text-neutral-espresso/80">{t.pesan}</p>
          <p className="mt-2 text-xs text-neutral-slate">{formatTanggalId(t.createdAt)}</p>

          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-neutral-espresso/10 pt-3">
            {!t.isApproved ? (
              <button
                type="button"
                disabled={busyId === t.id}
                onClick={() => handleApprove(t.id, true)}
                className="flex items-center gap-1 rounded-button bg-primary-teal/10 px-3 py-1.5 text-xs font-bold text-primary-teal-deep hover:bg-primary-teal/20"
              >
                {busyId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Setujui
              </button>
            ) : (
              <button
                type="button"
                disabled={busyId === t.id}
                onClick={() => handleApprove(t.id, false)}
                className="flex items-center gap-1 rounded-button bg-neutral-espresso/10 px-3 py-1.5 text-xs font-bold text-neutral-espresso hover:bg-neutral-espresso/20"
              >
                <X className="h-3.5 w-3.5" />
                Batalkan Persetujuan
              </button>
            )}

            <button
              type="button"
              disabled={busyId === t.id || !t.isApproved}
              onClick={() => handleFeatured(t.id, !t.isFeatured)}
              className={cn(
                "flex items-center gap-1 rounded-button px-3 py-1.5 text-xs font-bold disabled:opacity-40",
                t.isFeatured
                  ? "bg-joy-butter text-neutral-espresso"
                  : "bg-neutral-espresso/10 text-neutral-espresso hover:bg-neutral-espresso/20"
              )}
            >
              <Star className="h-3.5 w-3.5" />
              {t.isFeatured ? "Featured di Beranda" : "Jadikan Featured"}
            </button>

            <button
              type="button"
              disabled={busyId === t.id}
              onClick={() => handleDelete(t.id)}
              className="ml-auto flex items-center gap-1 rounded-button bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
