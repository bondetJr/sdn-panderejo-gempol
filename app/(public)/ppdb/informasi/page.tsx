import Link from "next/link";
import { CheckCircle2, Users, CalendarClock, ArrowRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getActivePpdbWaves, getWaveRegistrationStatus } from "@/lib/ppdb-data";
import { formatTanggalId } from "@/lib/utils";

const STATUS_CONFIG = {
  UPCOMING: { label: "Belum Dibuka", badge: "bg-amber-50 text-amber-700" },
  OPEN: { label: "Sedang Dibuka", badge: "bg-primary-teal/10 text-primary-teal-deep" },
  CLOSED: { label: "Ditutup", badge: "bg-neutral-slate/10 text-neutral-slate" },
} as const;

export const metadata = {
  title: "Informasi PPDB",
};

export default async function PpdbInformasiPage() {
  const waves = await getActivePpdbWaves();

  return (
    <>
      <PageHeader
        title="Informasi PPDB"
        description="Penerimaan Peserta Didik Baru (PPDB) SDN Panderejo Gempol Tahun Ajaran 2026/2027."
        breadcrumbs={[
          { label: "PPDB", href: "/ppdb/informasi" },
          { label: "Informasi PPDB" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {waves.length === 0 ? (
          <div className="rounded-card bg-white p-10 text-center shadow-soft">
            <p className="text-sm text-neutral-slate">
              Belum ada gelombang PPDB yang aktif saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {waves.map((wave) => {
              const kuotaSisa = wave.kuota - wave.kuotaTerisi;
              const persenTerisi = Math.min(
                100,
                Math.round((wave.kuotaTerisi / wave.kuota) * 100)
              );
              const waveStatus = getWaveRegistrationStatus(wave);
              const statusConfig = STATUS_CONFIG[waveStatus];
              return (
                <div
                  key={wave.id}
                  className="flex flex-col overflow-hidden rounded-card bg-white shadow-soft"
                >
                  <div className="flex items-center justify-between bg-primary-teal-deep px-5 py-4">
                    <div>
                      <h3 className="text-base font-extrabold text-white">
                        Jalur {wave.jalurLabel}
                      </h3>
                      <p className="text-xs text-white/70">
                        Tahun Ajaran {wave.tahunAjaran}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusConfig.badge}`}>
                      <Clock className="h-3 w-3" />
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex-1 p-5">
                    {/* Kuota */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-espresso">
                      <Users className="h-4 w-4 text-primary-teal" />
                      Kuota: {wave.kuotaTerisi} / {wave.kuota} terisi
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-espresso/10">
                      <div
                        className="h-full rounded-full bg-primary-teal"
                        style={{ width: `${persenTerisi}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-neutral-slate">
                      Sisa kuota: {kuotaSisa > 0 ? kuotaSisa : 0} siswa
                    </p>

                    {/* Tanggal */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-neutral-slate">
                      <CalendarClock className="h-4 w-4 text-primary-teal" />
                      {formatTanggalId(wave.tanggalBuka)} —{" "}
                      {formatTanggalId(wave.tanggalTutup)}
                    </div>

                    {/* Syarat */}
                    <h4 className="mt-5 text-xs font-bold uppercase tracking-wide text-neutral-slate">
                      Syarat Pendaftaran
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {wave.syaratList.map((syarat, idx) => (
                        <li key={idx} className="flex gap-2 text-xs text-neutral-espresso/80">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-teal" />
                          {syarat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 pt-0">
                    {waveStatus === "OPEN" ? (
                      <Link
                        href="/ppdb/daftar"
                        className="flex items-center justify-center gap-1.5 rounded-button bg-primary-teal px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                      >
                        Daftar Jalur Ini
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="flex cursor-not-allowed items-center justify-center gap-1.5 rounded-button bg-neutral-espresso/10 px-4 py-2.5 text-sm font-bold text-neutral-slate">
                        {waveStatus === "UPCOMING" ? "Belum Dibuka" : "Pendaftaran Ditutup"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 rounded-card bg-joy-butter/40 p-5 text-sm leading-relaxed text-neutral-espresso/90">
          <strong>Catatan:</strong> Pastikan seluruh dokumen persyaratan
          sudah disiapkan dalam format PDF/JPG/PNG (maks. 2MB per file)
          sebelum memulai pendaftaran online agar proses lebih cepat.
          Untuk pertanyaan lebih lanjut, silakan hubungi kami melalui menu{" "}
          <Link href="/kontak/hubungi-kami" className="font-semibold underline">
            Hubungi Kami
          </Link>.
        </div>
      </section>
    </>
  );
}
