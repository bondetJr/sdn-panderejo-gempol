import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PpdbFormMultiStep } from "@/components/ppdb/PpdbFormMultiStep";
import { getOpenPpdbWaves, getActivePpdbWaves } from "@/lib/ppdb-data";
import { formatTanggalId } from "@/lib/utils";

export const metadata = {
  title: "Daftar PPDB Online",
};

export default async function PpdbDaftarPage() {
  const openWaves = await getOpenPpdbWaves();

  const waveOptions = openWaves.map((w) => ({
    id: w.id,
    jalur: w.jalur,
    jalurLabel: w.jalurLabel,
    tahunAjaran: w.tahunAjaran,
  }));

  // Kalau tidak ada gelombang yang sedang buka, cari tahu kenapa —
  // supaya pesan ke pengguna informatif (belum dibuka vs semua sudah tutup)
  let infoMessage: { title: string; detail: string } | null = null;
  if (waveOptions.length === 0) {
    const allWaves = await getActivePpdbWaves();
    const upcoming = allWaves
      .filter((w) => new Date() < w.tanggalBuka)
      .sort((a, b) => a.tanggalBuka.getTime() - b.tanggalBuka.getTime())[0];

    if (upcoming) {
      infoMessage = {
        title: "Pendaftaran Belum Dibuka",
        detail: `Pendaftaran jalur ${upcoming.jalurLabel} akan dibuka mulai ${formatTanggalId(
          upcoming.tanggalBuka
        )}.`,
      };
    } else {
      infoMessage = {
        title: "Pendaftaran Sudah Ditutup",
        detail:
          "Periode pendaftaran PPDB saat ini sudah berakhir. Silakan cek menu Informasi PPDB untuk jadwal gelombang berikutnya, atau hubungi sekolah langsung.",
      };
    }
  }

  return (
    <>
      <PageHeader
        title="Daftar PPDB Online"
        description="Isi formulir berikut dengan data yang benar dan lengkap."
        breadcrumbs={[
          { label: "PPDB", href: "/ppdb/informasi" },
          { label: "Daftar Online" },
        ]}
      />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {waveOptions.length === 0 && infoMessage ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-joy-butter/60 text-neutral-espresso">
              <CalendarClock className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-base font-bold text-neutral-espresso">
              {infoMessage.title}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-slate">
              {infoMessage.detail}
            </p>
            <Link
              href="/ppdb/informasi"
              className="mt-5 inline-flex items-center justify-center rounded-button bg-primary-teal px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Lihat Informasi PPDB
            </Link>
          </div>
        ) : (
          <PpdbFormMultiStep waves={waveOptions} />
        )}
      </section>
    </>
  );
}
