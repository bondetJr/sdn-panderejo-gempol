"use client";

import { useState } from "react";
import {
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StatusResult = {
  noPendaftaran: string;
  namaLengkap: string;
  jalur: string;
  status: string;
  catatanVerifikasi: string | null;
  tahunAjaran: string;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; icon: React.ElementType; desc: string }
> = {
  MENUNGGU_VERIFIKASI: {
    label: "Menunggu Verifikasi",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    desc: "Berkas Anda sedang menunggu untuk diverifikasi oleh panitia PPDB.",
  },
  DIVERIFIKASI: {
    label: "Terverifikasi",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    icon: FileSearch,
    desc: "Berkas Anda sudah diverifikasi. Menunggu pengumuman hasil seleksi.",
  },
  DITERIMA: {
    label: "Diterima",
    badge: "bg-primary-teal/10 text-primary-teal-deep border-primary-teal/30",
    icon: CheckCircle2,
    desc: "Selamat! Calon siswa dinyatakan DITERIMA di SDN Panderejo Gempol.",
  },
  CADANGAN: {
    label: "Cadangan",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    icon: Star,
    desc: "Calon siswa masuk dalam daftar cadangan. Mohon menunggu informasi lebih lanjut.",
  },
  DITOLAK: {
    label: "Tidak Diterima",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
    desc: "Mohon maaf, calon siswa belum dapat diterima pada gelombang ini.",
  },
};

const JALUR_LABEL: Record<string, string> = {
  ZONASI: "Zonasi",
  AFIRMASI: "Afirmasi",
  PERPINDAHAN: "Perpindahan Orang Tua",
};

export function CekStatusForm() {
  const [noPendaftaran, setNoPendaftaran] = useState("");
  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ppdb/cek-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noPendaftaran: noPendaftaran.trim(), nik: nik.trim() }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Data tidak ditemukan.");
        return;
      }
      setResult(json.data);
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const config = result ? STATUS_CONFIG[result.status] : null;
  const StatusIcon = config?.icon ?? Clock;

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="rounded-card bg-white p-6 shadow-soft sm:p-8"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              Nomor Pendaftaran
            </label>
            <input
              value={noPendaftaran}
              onChange={(e) => setNoPendaftaran(e.target.value)}
              required
              placeholder="Contoh: PPDB-2026-000123"
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-espresso">
              NIK Calon Siswa
            </label>
            <input
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              required
              inputMode="numeric"
              maxLength={16}
              placeholder="16 digit angka"
              className="input-field mt-1.5"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-button bg-primary-teal px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {loading ? "Mencari..." : "Cek Status"}
        </button>

        <p className="mt-3 text-xs text-neutral-slate">
          Nomor Pendaftaran &amp; NIK harus sesuai dengan data saat
          pendaftaran. Data ini hanya menampilkan status milik Anda sendiri.
        </p>
      </form>

      {error && (
        <div className="mt-5 rounded-card bg-red-50 p-5 text-sm text-red-700 shadow-soft">
          {error}
        </div>
      )}

      {result && config && (
        <div
          className={cn(
            "mt-5 rounded-card border-2 bg-white p-6 shadow-soft sm:p-8",
            config.badge.split(" ")[2] // border color
          )}
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-neutral-slate">
                No. Pendaftaran: {result.noPendaftaran}
              </p>
              <h3 className="mt-1 text-lg font-extrabold text-neutral-espresso">
                {result.namaLengkap}
              </h3>
              <p className="text-sm text-neutral-slate">
                Jalur {JALUR_LABEL[result.jalur] ?? result.jalur} · TA{" "}
                {result.tahunAjaran}
              </p>
            </div>
            <span
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold",
                config.badge
              )}
            >
              <StatusIcon className="h-4 w-4" />
              {config.label}
            </span>
          </div>

          <div className="mt-5 rounded-2xl bg-neutral-espresso/[0.03] p-4">
            <p className="text-sm leading-relaxed text-neutral-espresso/90">
              {result.catatanVerifikasi || config.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
