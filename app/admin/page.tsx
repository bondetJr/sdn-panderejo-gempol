import Link from "next/link";
import {
  ClipboardList,
  Newspaper,
  Users,
  MessageSquareWarning,
} from "lucide-react";
import { getOverviewStats } from "@/lib/admin-data";
import { getAllServiceStandardsAdmin } from "@/lib/layanan-data";
import { PpdbJalurChart } from "@/components/admin/PpdbJalurChart";
import { LayananManager } from "@/components/admin/LayananManager";
import { formatTanggalId } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  MENUNGGU_VERIFIKASI: "bg-amber-50 text-amber-700",
  DIVERIFIKASI: "bg-sky-50 text-sky-700",
  DITERIMA: "bg-primary-teal/10 text-primary-teal-deep",
  CADANGAN: "bg-violet-50 text-violet-700",
  DITOLAK: "bg-rose-50 text-rose-700",
};

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU_VERIFIKASI: "Menunggu Verifikasi",
  DIVERIFIKASI: "Terverifikasi",
  DITERIMA: "Diterima",
  CADANGAN: "Cadangan",
  DITOLAK: "Ditolak",
};

export default async function AdminOverviewPage() {
  const [stats, layanan] = await Promise.all([
    getOverviewStats(),
    getAllServiceStandardsAdmin(),
  ]);

  const bento = [
    {
      label: "Total Pendaftar PPDB",
      value: stats.totalPendaftarPpdb,
      icon: ClipboardList,
      href: "/admin/ppdb",
      color: "bg-primary-teal/10 text-primary-teal-deep",
    },
    {
      label: "Berita Dipublikasikan",
      value: stats.totalBerita,
      icon: Newspaper,
      href: "/admin/informasi",
      color: "bg-sky-50 text-sky-700",
    },
    {
      label: "Guru Aktif",
      value: stats.totalGuruAktif,
      icon: Users,
      href: "/admin/guru",
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pesan Belum Dibaca",
      value: stats.pesanBelumBaca,
      icon: MessageSquareWarning,
      href: "/admin/kontak",
      color: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Selamat Datang 👋
        </h1>
        <p className="text-sm text-neutral-slate">
          Ringkasan aktivitas website SDN Panderejo Gempol.
        </p>
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bento.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-card bg-white p-5 shadow-soft transition-transform hover:-translate-y-1"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-2xl font-extrabold text-neutral-espresso">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-neutral-slate">{item.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Chart */}
        <div className="rounded-card bg-white p-5 shadow-soft lg:col-span-2">
          <h2 className="text-sm font-bold text-neutral-espresso">
            Pendaftar per Jalur PPDB
          </h2>
          <div className="mt-4">
            <PpdbJalurChart data={stats.chartJalur} />
          </div>
        </div>

        {/* Tabel pendaftar terbaru */}
        <div className="overflow-hidden rounded-card bg-white shadow-soft lg:col-span-3">
          <div className="flex items-center justify-between border-b border-neutral-espresso/10 px-5 py-4">
            <h2 className="text-sm font-bold text-neutral-espresso">
              Pendaftar PPDB Terbaru
            </h2>
            <Link
              href="/admin/ppdb"
              className="text-xs font-semibold text-primary-teal-deep hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="bg-neutral-espresso/[0.03] text-xs font-bold uppercase tracking-wide text-neutral-slate">
                  <th className="px-5 py-3">No. Pendaftaran</th>
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Jalur</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendaftarTerbaru.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-neutral-espresso/5 last:border-0 hover:bg-primary-teal/5"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-neutral-espresso">
                      {p.noPendaftaran}
                    </td>
                    <td className="px-5 py-3 font-medium text-neutral-espresso">
                      {p.namaLengkap}
                    </td>
                    <td className="px-5 py-3 text-neutral-slate">{p.jalur}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          STATUS_BADGE[p.status] ?? "bg-neutral-slate/10 text-neutral-slate"
                        }`}
                      >
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="layanan" className="mt-8 rounded-card bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-teal-deep">Standar Pelayanan</p>
            <h2 className="mt-1 text-base font-extrabold text-neutral-espresso">Kelola layanan sekolah</h2>
          </div>
        </div>
        <LayananManager items={layanan} />
      </div>
    </div>
  );
}
