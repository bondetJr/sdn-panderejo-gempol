import Link from "next/link";
import { Settings2, Eye } from "lucide-react";
import { getApplicantsList } from "@/lib/admin-ppdb-data";
import { formatTanggalId } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "PPDB Manager" };

const STATUS_TABS = [
  { value: "SEMUA", label: "Semua" },
  { value: "MENUNGGU_VERIFIKASI", label: "Menunggu Verifikasi" },
  { value: "DIVERIFIKASI", label: "Terverifikasi" },
  { value: "DITERIMA", label: "Diterima" },
  { value: "CADANGAN", label: "Cadangan" },
  { value: "DITOLAK", label: "Ditolak" },
];

const STATUS_BADGE: Record<string, string> = {
  MENUNGGU_VERIFIKASI: "bg-amber-50 text-amber-700",
  DIVERIFIKASI: "bg-sky-50 text-sky-700",
  DITERIMA: "bg-primary-teal/10 text-primary-teal-deep",
  CADANGAN: "bg-violet-50 text-violet-700",
  DITOLAK: "bg-rose-50 text-rose-700",
};

const JALUR_LABEL: Record<string, string> = {
  ZONASI: "Zonasi",
  AFIRMASI: "Afirmasi",
  PERPINDAHAN: "Perpindahan",
};

export default async function PpdbManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status ?? "SEMUA";
  const applicants = await getApplicantsList(activeStatus);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-espresso">
            PPDB Manager
          </h1>
          <p className="text-sm text-neutral-slate">
            Kelola pendaftar dan verifikasi dokumen PPDB.
          </p>
        </div>
        <Link
          href="/admin/ppdb/gelombang"
          className="flex items-center gap-2 rounded-button bg-primary-teal-deep px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Settings2 className="h-4 w-4" />
          Kelola Gelombang
        </Link>
      </div>

      {/* Filter Status */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "SEMUA" ? "/admin/ppdb" : `/admin/ppdb?status=${tab.value}`}
            className={cn(
              "rounded-button px-4 py-2 text-xs font-bold transition-colors",
              activeStatus === tab.value
                ? "bg-primary-teal text-white shadow-soft"
                : "bg-white text-neutral-espresso hover:bg-primary-teal/10"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tabel */}
      <div className="mt-5 overflow-hidden rounded-card bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-espresso/10 bg-neutral-espresso/[0.03] text-xs font-bold uppercase tracking-wide text-neutral-slate">
                <th className="px-5 py-3">No. Pendaftaran</th>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Jalur</th>
                <th className="px-5 py-3">Tgl Daftar</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-neutral-slate">
                    Tidak ada data pendaftar untuk filter ini.
                  </td>
                </tr>
              ) : (
                applicants.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-neutral-espresso/5 last:border-0 hover:bg-primary-teal/5"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-neutral-espresso">
                      {a.noPendaftaran}
                    </td>
                    <td className="px-5 py-3 font-medium text-neutral-espresso">
                      {a.namaLengkap}
                    </td>
                    <td className="px-5 py-3 text-neutral-slate">
                      {JALUR_LABEL[a.jalur] ?? a.jalur}
                    </td>
                    <td className="px-5 py-3 text-neutral-slate">
                      {formatTanggalId(a.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-bold",
                          STATUS_BADGE[a.status] ?? "bg-neutral-slate/10 text-neutral-slate"
                        )}
                      >
                        {a.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/ppdb/${a.id}`}
                        className="inline-flex items-center gap-1.5 rounded-button bg-primary-teal-deep px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
