"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Clock3, Download, FileText, MapPinned, ShieldCheck, Wallet } from "lucide-react";
import type { ServiceStandardItem } from "@/lib/layanan-data";

export function LayananGrid({ items }: { items: ServiceStandardItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <article
            key={item.id}
            className="group overflow-hidden rounded-[28px] border border-white/40 bg-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,23,42,0.12)]"
          >
            <div className="relative h-56 overflow-hidden">
              {item.coverImage ? (
                <Image src={item.coverImage} alt={item.judul ?? item.nama} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-teal/20 via-primary-yellow/20 to-primary-orange/20 text-neutral-slate">
                  <FileText className="h-10 w-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                  Standar Pelayanan
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-neutral-espresso">{item.judul ?? item.nama}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-slate">{item.deskripsi}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="shrink-0 rounded-full border border-primary-teal/20 bg-primary-teal/5 px-3 py-1.5 text-[11px] font-bold text-primary-teal-deep transition hover:bg-primary-teal hover:text-white"
                >
                  {isOpen ? "Tutup" : "Detail"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {item.waktuPelayanan && (
                  <div className="flex items-center gap-2 rounded-2xl border border-neutral-espresso/10 bg-neutral-espresso/3 px-3 py-2 text-sm text-neutral-espresso">
                    <Clock3 className="h-4 w-4 text-primary-teal-deep" />
                    <span>{item.waktuPelayanan}</span>
                  </div>
                )}
                {item.biaya && (
                  <div className="flex items-center gap-2 rounded-2xl border border-neutral-espresso/10 bg-neutral-espresso/3 px-3 py-2 text-sm text-neutral-espresso">
                    <Wallet className="h-4 w-4 text-primary-teal-deep" />
                    <span>{item.biaya}</span>
                  </div>
                )}
              </div>

              {item.documentFile && (
                <a
                  href={item.documentFile}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-button bg-primary-teal px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-teal-deep"
                >
                  <Download className="h-4 w-4" />
                  Download Dokumen
                </a>
              )}

              {isOpen && (
                <div className="mt-6 space-y-5 rounded-3xl border border-primary-teal/10 bg-gradient-to-br from-primary-teal/5 via-white to-primary-yellow/5 p-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-teal-deep">
                      <ShieldCheck className="h-4 w-4" />
                      Persyaratan
                    </div>
                    <div className="whitespace-pre-line text-sm leading-6 text-neutral-slate">{item.persyaratan}</div>
                  </div>

                  {item.mekanismeImage && (
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-teal-deep">
                        <MapPinned className="h-4 w-4" />
                        Mekanisme
                      </div>
                      <div className="overflow-hidden rounded-2xl">
                        <Image src={item.mekanismeImage} alt={`${(item.judul ?? item.nama)} mekanisme`} width={900} height={500} className="h-52 w-full object-cover" unoptimized />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-teal-deep">
                      <ArrowRight className="h-4 w-4" />
                      Keterangan
                    </div>
                    <div className="whitespace-pre-line text-sm leading-6 text-neutral-slate">{item.mekanismeText}</div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-teal-deep">
                      <FileText className="h-4 w-4" />
                      Produk Layanan
                    </div>
                    <div className="whitespace-pre-line text-sm leading-6 text-neutral-slate">{item.produkLayanan}</div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary-teal-deep">
                      <ShieldCheck className="h-4 w-4" />
                      Pengaduan
                    </div>
                    <div className="whitespace-pre-line text-sm leading-6 text-neutral-slate">{item.pengaduan}</div>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
