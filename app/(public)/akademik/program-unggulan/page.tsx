import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { ProgramUnggulanClient } from "./ProgramUnggulanClient";

export const dynamic = "force-dynamic";

export default async function ProgramUnggulanPage() {
  const programs = await prisma.flagshipProgram.findMany({
    where: { isPublished: true },
    orderBy: { urutan: "asc" },
    select: {
      id: true,
      nama: true,
      deskripsiSingkat: true,
      deskripsiLengkap: true,
      fotoUrl: true,
      realisasiText: true,
      impactUtama: true,
      impactSatu: true,
      impactDua: true,
      impactTiga: true,
      icon: true,
      subImages: {
        orderBy: { urutan: "asc" },
        select: { id: true, url: true, urutan: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Program Unggulan Sekolah"
        description="Beragam program pilihan untuk mengembangkan potensi, karakter, dan prestasi peserta didik."
        breadcrumbs={[
          { label: "Akademik", href: "/akademik" },
          { label: "Program Unggulan" },
        ]}
      />
      <ProgramUnggulanClient programs={programs} />
    </>
  );
}
