"use client";

import { useState } from "react";
import { Loader2, Mail, MailOpen, Trash2, Phone, AlertTriangle } from "lucide-react";
import { cn, formatTanggalId } from "@/lib/utils";
import { markMessageRead, deleteMessage } from "@/lib/actions/kontak-admin";

type MessageItem = {
  id: string;
  nama: string;
  email: string | null;
  telepon: string | null;
  subjek: string | null;
  pesan: string;
  isRead: boolean;
  isPengaduan: boolean;
  createdAt: Date;
};

export function MessageManager({ messages }: { messages: MessageItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleToggleRead(msg: MessageItem) {
    setBusyId(msg.id);
    try {
      await markMessageRead(msg.id, !msg.isRead);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pesan ini?")) return;
    setBusyId(id);
    try {
      await deleteMessage(id);
    } finally {
      setBusyId(null);
    }
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
        Belum ada pesan masuk.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => {
        const isExpanded = expandedId === msg.id;
        return (
          <div
            key={msg.id}
            className={cn(
              "overflow-hidden rounded-card shadow-soft transition-colors",
              msg.isRead ? "bg-white" : "bg-primary-teal/[0.04] ring-1 ring-primary-teal/20"
            )}
          >
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : msg.id)}
              className="flex w-full items-start justify-between gap-3 p-5 text-left"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    msg.isRead
                      ? "bg-neutral-espresso/10 text-neutral-slate"
                      : "bg-primary-teal/10 text-primary-teal-deep"
                  )}
                >
                  {msg.isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {msg.isPengaduan && (
                      <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        <AlertTriangle className="h-3 w-3" />
                        PENGADUAN
                      </span>
                    )}
                    <p className="text-xs text-neutral-slate">
                      {formatTanggalId(msg.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-bold text-neutral-espresso">
                    {msg.subjek || "(Tanpa subjek)"}
                  </p>
                  <p className="text-xs text-neutral-slate">
                    {msg.nama} {msg.email && `· ${msg.email}`}
                  </p>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-neutral-espresso/10 px-5 py-4">
                <p className="text-sm leading-relaxed text-neutral-espresso/90">{msg.pesan}</p>
                {msg.telepon && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-slate">
                    <Phone className="h-3.5 w-3.5" />
                    {msg.telepon}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === msg.id}
                    onClick={() => handleToggleRead(msg)}
                    className="flex items-center gap-1.5 rounded-button bg-primary-teal-deep/10 px-3 py-1.5 text-xs font-bold text-primary-teal-deep hover:bg-primary-teal-deep/20"
                  >
                    {busyId === msg.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : msg.isRead ? (
                      <Mail className="h-3.5 w-3.5" />
                    ) : (
                      <MailOpen className="h-3.5 w-3.5" />
                    )}
                    {msg.isRead ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === msg.id}
                    onClick={() => handleDelete(msg.id)}
                    className="flex items-center gap-1.5 rounded-button bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
