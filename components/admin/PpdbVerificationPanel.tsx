"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  FileText,
  CheckCircle2,
  Circle,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Star,
  FileSearch,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateApplicantStatus,
  toggleDocumentVerified,
} from "@/lib/actions/ppdb-admin";
import { JENIS_LABEL, type ApplicantDetail } from "@/lib/admin-ppdb-data";

export function PpdbVerificationPanel({
  applicant,
}: {
  applicant: ApplicantDetail;
}) {
  const [catatan, setCatatan] = useState(applicant.catatanVerifikasi ?? "");
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  function handleStatusChange(status: Parameters<typeof updateApplicantStatus>[1]) {
    setPendingAction(status);
    startTransition(async () => {
      await updateApplicantStatus(applicant.id, status, catatan);
      setPendingAction(null);
    });
  }

  function handleToggleDoc(docId: string, current: boolean) {
    setToggling(docId);
    startTransition(async () => {
      await toggleDocumentVerified(docId, applicant.id, !current);
      setToggling(null);
    });
  }

  const isImage = (url: string) => /\.(jpg|jpeg|png)(\?|$)/i.test(url);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Kolom kiri: Data pendaftar */}
      <div className="space-y-4 lg:col-span-1">
        <div className="rounded-card bg-white p-5 shadow-soft">
          <h2 className="text-sm font-bold text-neutral-espresso">
            Data Calon Siswa
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Nama Lengkap" value={applicant.namaLengkap} />
            <Row label="NIK" value={applicant.nik} />
            <Row label="NISN" value={applicant.nisn ?? "-"} />
            <Row
              label="TTL"
              value={`${applicant.tempatLahir}, ${new Date(
                applicant.tanggalLahir
              ).toLocaleDateString("id-ID")}`}
            />
            <Row
              label="Jenis Kelamin"
              value={applicant.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
            />
            <Row label="Jalur" value={applicant.jalur} />
            {applicant.jarakKeSekolahKm !== null && (
              <Row label="Jarak ke Sekolah" value={`${applicant.jarakKeSekolahKm} km`} />
            )}
          </div>
        </div>

        <div className="rounded-card bg-white p-5 shadow-soft">
          <h2 className="text-sm font-bold text-neutral-espresso">
            Data Orang Tua
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Nama Ayah" value={applicant.namaAyah} />
            <Row label="Nama Ibu" value={applicant.namaIbu} />
            <Row label="No. HP" value={applicant.noHpOrtu} />
            <Row label="Alamat" value={applicant.alamat} />
          </div>
        </div>
      </div>

      {/* Kolom kanan: Dokumen + Aksi */}
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-card bg-white p-5 shadow-soft">
          <h2 className="text-sm font-bold text-neutral-espresso">
            Dokumen Persyaratan
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {applicant.documents.map((doc) => (
              <div
                key={doc.id}
                className="overflow-hidden rounded-2xl border border-neutral-espresso/10"
              >
                <div className="flex h-32 items-center justify-center bg-neutral-espresso/[0.03]">
                  {doc.signedUrl ? (
                    isImage(doc.signedUrl) ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={doc.signedUrl}
                          alt={JENIS_LABEL[doc.jenis] ?? doc.jenis}
                          fill
                          className="object-contain"
                          sizes="300px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <FileText className="h-10 w-10 text-neutral-slate/40" />
                    )
                  ) : (
                    <FileText className="h-10 w-10 text-neutral-slate/30" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-neutral-espresso">
                    {JENIS_LABEL[doc.jenis] ?? doc.jenis}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {doc.signedUrl ? (
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-primary-teal-deep hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Buka File
                      </a>
                    ) : (
                      <span className="text-xs text-neutral-slate">
                        File belum tersedia
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleDoc(doc.id, doc.isVerified)}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
                        doc.isVerified
                          ? "bg-primary-teal/10 text-primary-teal-deep"
                          : "bg-neutral-espresso/10 text-neutral-slate"
                      )}
                    >
                      {toggling === doc.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : doc.isVerified ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                      {doc.isVerified ? "Valid" : "Tandai Valid"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catatan */}
        <div className="rounded-card bg-white p-5 shadow-soft">
          <label className="text-sm font-bold text-neutral-espresso">
            Catatan Verifikasi (opsional, akan tampil ke pendaftar)
          </label>
          <textarea
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: Berkas lengkap dan valid. Menunggu pengumuman hasil seleksi."
            className="input-field mt-2 resize-none"
          />
        </div>

        {/* Panel Aksi — dark background, tombol Terima pakai Lime sesuai aturan warna */}
        <div className="rounded-card bg-neutral-graphite p-5 shadow-soft">
          <h3 className="text-sm font-bold text-white">Aksi Verifikasi</h3>
          <p className="mt-1 text-xs text-white/50">
            Status saat ini:{" "}
            <span className="font-bold text-white">
              {applicant.status.replaceAll("_", " ")}
            </span>
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <ActionButton
              icon={FileSearch}
              label="Verifikasi"
              onClick={() => handleStatusChange("DIVERIFIKASI")}
              loading={isPending && pendingAction === "DIVERIFIKASI"}
              className="bg-sky-500/20 text-sky-300 hover:bg-sky-500/30"
            />
            <ActionButton
              icon={ThumbsUp}
              label="Terima"
              onClick={() => handleStatusChange("DITERIMA")}
              loading={isPending && pendingAction === "DITERIMA"}
              className="bg-accent-lime text-neutral-graphite hover:brightness-95"
            />
            <ActionButton
              icon={Star}
              label="Cadangan"
              onClick={() => handleStatusChange("CADANGAN")}
              loading={isPending && pendingAction === "CADANGAN"}
              className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
            />
            <ActionButton
              icon={ThumbsDown}
              label="Tolak"
              onClick={() => handleStatusChange("DITOLAK")}
              loading={isPending && pendingAction === "DITOLAK"}
              className="bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-espresso/5 pb-2 last:border-0">
      <span className="text-xs text-neutral-slate">{label}</span>
      <span className="font-medium text-neutral-espresso">{value}</span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
  className,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  loading: boolean;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-xs font-bold transition-colors disabled:opacity-60",
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}
