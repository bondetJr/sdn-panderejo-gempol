"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  ChevronDown,
  Clock,
  Download,
  FileText,
  ListChecks,
  MessageSquareWarning,
  Package,
  Wallet,
  Workflow,
  X,
} from "lucide-react";
import type { ServiceStandardItem } from "@/lib/layanan-data";

function toLines(value: string | null): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.replace(/^[-•\d.\s]+/, "").trim())
    .filter(Boolean);
}

export function LayananGrid({ items }: { items: ServiceStandardItem[] }) {
  const [selected, setSelected] = useState<ServiceStandardItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-neutral-espresso/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_48px_rgba(10,92,92,0.18)] hover:ring-primary-teal/30"
          >
            <div className="relative h-44 overflow-hidden bg-primary-teal/10">
              {item.coverImage ? (
                <Image
                  src={item.coverImage}
                  alt={item.nama}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-teal-deep to-primary-teal">
                  <FileText className="h-10 w-10 text-white/70" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-graphite/70 via-neutral-graphite/10 to-transparent" />
              <h3 className="absolute inset-x-4 bottom-3 text-base font-extrabold leading-snug text-white drop-shadow">
                {item.nama}
              </h3>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <p className="text-sm leading-relaxed text-neutral-slate line-clamp-3">
                {item.deskripsi}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.waktuPelayanan && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-teal/10 px-2.5 py-1 text-[11px] font-semibold text-primary-teal-deep">
                    <Clock className="h-3 w-3" />
                    {item.waktuPelayanan}
                  </span>
                )}
                {item.biaya && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-joy-butter/50 px-2.5 py-1 text-[11px] font-semibold text-neutral-espresso">
                    <Wallet className="h-3 w-3" />
                    {item.biaya}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-neutral-espresso/10 pt-4">
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="inline-flex items-center gap-1.5 rounded-button bg-primary-teal px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
                >
                  Lihat Detail
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {item.documentFile && (
                  <a
                    href={item.documentFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 rounded-button bg-primary-teal-deep/10 px-4 py-2 text-xs font-bold text-primary-teal-deep transition-colors hover:bg-primary-teal-deep/20"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Dokumen
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <LayananDetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function LayananDetailModal({
  item,
  onClose,
}: {
  item: ServiceStandardItem;
  onClose: () => void;
}) {
  const persyaratan = toLines(item.persyaratan);
  const mekanisme = toLines(item.mekanismeText);
  const produk = toLines(item.produkLayanan);

  return (
    <div
      className="fixed inset-0 z-100 flex items-end justify-center bg-neutral-graphite/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-card bg-base-cloud shadow-soft sm:rounded-card"
      >
        <div className="relative h-48 bg-primary-teal/10 sm:h-56">
          {item.coverImage ? (
            <Image
              src={item.coverImage}
              alt={item.nama}
              fill
              sizes="768px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-teal-deep to-primary-teal">
              <FileText className="h-12 w-12 text-white/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-graphite/80 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-espresso hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="absolute inset-x-5 bottom-4 text-xl font-extrabold text-white drop-shadow sm:text-2xl">
            {item.nama}
          </h2>
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          <DetailSection
            icon={<BadgeCheck className="h-4 w-4" />}
            title="Deskripsi"
            defaultOpen
          >
            <p className="text-justify text-sm leading-relaxed text-neutral-espresso/80">
              {item.deskripsi}
            </p>
          </DetailSection>

          <DetailSection icon={<ListChecks className="h-4 w-4" />} title="Persyaratan">
            {persyaratan.length > 0 ? (
              <ol className="space-y-2">
                {persyaratan.map((syarat, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-neutral-espresso/80">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-teal/15 text-[11px] font-bold text-primary-teal-deep">
                      {i + 1}
                    </span>
                    {syarat}
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyText />
            )}
          </DetailSection>

          <DetailSection icon={<Workflow className="h-4 w-4" />} title="Mekanisme & Prosedur">
            {item.mekanismeImage && (
              <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-2xl bg-white">
                <Image
                  src={item.mekanismeImage}
                  alt={`Mekanisme ${item.nama}`}
                  fill
                  sizes="700px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            {mekanisme.length > 0 ? (
              <ol className="space-y-2">
                {mekanisme.map((langkah, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-neutral-espresso/80">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-teal-deep/10 text-[11px] font-bold text-primary-teal-deep">
                      {i + 1}
                    </span>
                    {langkah}
                  </li>
                ))}
              </ol>
            ) : (
              !item.mekanismeImage && <EmptyText />
            )}
          </DetailSection>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoTile
              icon={<Clock className="h-4 w-4" />}
              title="Waktu Pelayanan"
              value={item.waktuPelayanan}
            />
            <InfoTile
              icon={<Wallet className="h-4 w-4" />}
              title="Biaya"
              value={item.biaya}
            />
          </div>

          <DetailSection icon={<Package className="h-4 w-4" />} title="Produk Layanan">
            {produk.length > 0 ? (
              <ul className="space-y-2">
                {produk.map((p, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-neutral-espresso/80">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-teal" />
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyText />
            )}
          </DetailSection>

          <DetailSection
            icon={<MessageSquareWarning className="h-4 w-4" />}
            title="Pengaduan & Saran"
          >
            {item.pengaduan ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-espresso/80">
                {item.pengaduan}
              </p>
            ) : (
              <EmptyText />
            )}
          </DetailSection>

          {item.documentFile && (
            <a
              href={item.documentFile}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center justify-center gap-2 rounded-button bg-primary-teal px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              Download Dokumen {item.documentName ? `(${item.documentName})` : ""}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-card bg-white ring-1 ring-neutral-espresso/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-primary-teal/5"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-neutral-espresso">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
            {icon}
          </span>
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-slate transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="border-t border-neutral-espresso/10 px-4 py-4">{children}</div>}
    </div>
  );
}

function InfoTile({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | null;
}) {
  return (
    <div className="rounded-card bg-white p-4 ring-1 ring-neutral-espresso/5">
      <p className="flex items-center gap-2 text-xs font-semibold text-neutral-slate">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
          {icon}
        </span>
        {title}
      </p>
      <p className="mt-2 text-sm font-bold text-neutral-espresso">
        {value ?? "Belum diinformasikan"}
      </p>
    </div>
  );
}

function EmptyText() {
  return <p className="text-sm text-neutral-slate">Belum diinformasikan.</p>;
}
