import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAllWavesAdmin } from "@/lib/admin-ppdb-data";
import { PpdbWaveManager } from "@/components/admin/PpdbWaveManager";

export const metadata = { title: "Kelola Gelombang PPDB" };

export default async function PpdbGelombangPage() {
  const waves = await getAllWavesAdmin();

  return (
    <div>
      <Link
        href="/admin/ppdb"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-slate hover:text-primary-teal-deep"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Daftar Pendaftar
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Kelola Gelombang PPDB
        </h1>
        <p className="text-sm text-neutral-slate">
          Atur jalur, kuota, periode, dan syarat pendaftaran per gelombang.
        </p>
      </div>

      <PpdbWaveManager waves={waves} />
    </div>
  );
}
