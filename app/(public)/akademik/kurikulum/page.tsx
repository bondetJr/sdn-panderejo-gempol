import { BookOpenText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";

const DEFAULT_KURIKULUM = `SD Negeri Panderejo Gempol menerapkan Kurikulum Merdeka sesuai dengan kebijakan Kementerian Pendidikan Dasar dan Menengah (Kemendikdasmen). Kurikulum ini dirancang untuk memberikan keleluasaan bagi guru dalam menciptakan pembelajaran yang berkualitas dan sesuai dengan kebutuhan serta minat peserta didik.

Prinsip utama: pembelajaran berpusat pada peserta didik, berbasis proyek untuk pengembangan soft skills dan karakter (Projek Penguatan Profil Pelajar Pancasila), materi esensial dan pembelajaran mendalam, fleksibel dalam metode dan penyesuaian dengan kebutuhan siswa, serta penilaian yang holistik.

Catatan: Struktur kurikulum, alokasi jam pelajaran, dan capaian pembelajaran mengacu pada regulasi Kemendikdasmen tentang Kurikulum Merdeka yang berlaku.`;

async function getKurikulumText() {
  try {
    const school = await prisma.school.findFirst();
    return school?.kurikulumText || DEFAULT_KURIKULUM;
  } catch {
    return DEFAULT_KURIKULUM;
  }
}

export default async function KurikulumPage() {
  const kurikulumText = await getKurikulumText();
  const paragraphs = kurikulumText.split("\n").filter(Boolean);

  return (
    <>
      <PageHeader
        title="Kurikulum"
        breadcrumbs={[
          { label: "Akademik", href: "/akademik" },
          { label: "Kurikulum" },
        ]}
      />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-card bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
              <BookOpenText className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-extrabold text-neutral-espresso">
              Kurikulum SDN Panderejo Gempol
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {paragraphs.map((p: string, idx: number) => (
              <p
                key={idx}
                className="text-justify text-sm leading-relaxed text-neutral-espresso/90 sm:text-base"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
