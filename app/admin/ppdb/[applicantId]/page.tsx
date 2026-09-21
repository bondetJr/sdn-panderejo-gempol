import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { getApplicantDetail } from "@/lib/admin-ppdb-data";
import { PpdbVerificationPanel } from "@/components/admin/PpdbVerificationPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ applicantId: string }>;
}): Promise<Metadata> {
  const { applicantId } = await params;
  const applicant = await getApplicantDetail(applicantId);

  return {
    title: applicant
      ? `${applicant.namaLengkap} - Verifikasi PPDB`
      : "Pendaftar PPDB Tidak Ditemukan",
    description: applicant
      ? `Detail verifikasi pendaftar ${applicant.namaLengkap}, nomor ${applicant.noPendaftaran}, jalur ${applicant.jalur}.`
      : "Data pendaftar PPDB yang Anda cari tidak ditemukan.",
  };
}

export default async function PpdbApplicantDetailPage({
  params,
}: {
  params: Promise<{ applicantId: string }>;
}) {
  const { applicantId } = await params;
  const applicant = await getApplicantDetail(applicantId);

  if (!applicant) notFound();

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
          {applicant.namaLengkap}
        </h1>
        <p className="font-mono text-sm text-neutral-slate">
          {applicant.noPendaftaran} · TA {applicant.tahunAjaran}
        </p>
      </div>

      <PpdbVerificationPanel applicant={applicant} />
    </div>
  );
}
