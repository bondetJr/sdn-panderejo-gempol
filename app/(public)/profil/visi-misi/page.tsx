import { Eye, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getSchoolProfile } from "@/lib/school";
import { prisma } from "@/lib/prisma";

async function getVisiMisi() {
  try {
    const school = await prisma.school.findFirst();
    return {
      visi:
        school?.visi ??
        "Terwujudnya peserta didik yang religius, berakhlak mulia, cerdas, mandiri, dan peduli lingkungan.",
      misi: school?.misi
        ? school.misi.split("\n").filter(Boolean)
        : [
            "Menanamkan nilai-nilai keagamaan dan akhlak mulia dalam kehidupan sehari-hari.",
            "Menyelenggarakan pembelajaran yang aktif, kreatif, efektif, dan menyenangkan.",
            "Mengembangkan budaya literasi dan numerasi sejak dini.",
            "Membiasakan pola hidup bersih, sehat, dan peduli terhadap lingkungan.",
            "Mengembangkan potensi peserta didik di bidang akademik maupun non-akademik.",
            "Membangun kerja sama yang baik antara sekolah, orang tua, dan masyarakat.",
          ],
    };
  } catch {
    return {
      visi:
        "Terwujudnya peserta didik yang religius, berakhlak mulia, cerdas, mandiri, dan peduli lingkungan.",
      misi: [
        "Menanamkan nilai-nilai keagamaan dan akhlak mulia dalam kehidupan sehari-hari.",
        "Menyelenggarakan pembelajaran yang aktif, kreatif, efektif, dan menyenangkan.",
        "Mengembangkan budaya literasi dan numerasi sejak dini.",
        "Membiasakan pola hidup bersih, sehat, dan peduli terhadap lingkungan.",
        "Mengembangkan potensi peserta didik di bidang akademik maupun non-akademik.",
        "Membangun kerja sama yang baik antara sekolah, orang tua, dan masyarakat.",
      ],
    };
  }
}

export default async function VisiMisiPage() {
  const school = await getSchoolProfile();
  const { visi, misi } = await getVisiMisi();

  return (
    <>
      <PageHeader
        title="Visi & Misi"
        breadcrumbs={[
          { label: "Profil Sekolah", href: "/profil" },
          { label: "Visi & Misi" },
        ]}
      />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Visi */}
        <div className="rounded-card bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
              <Eye className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-extrabold text-neutral-espresso">
              Visi
            </h2>
          </div>
          <p className="mt-4 rounded-2xl bg-primary-teal-deep/5 p-5 text-base font-medium italic leading-relaxed text-neutral-espresso">
            &ldquo;{visi}&rdquo;
          </p>
        </div>

        {/* Misi */}
        <div className="mt-6 rounded-card bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
              <Target className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-extrabold text-neutral-espresso">
              Misi
            </h2>
          </div>
          <ol className="mt-4 space-y-3">
            {misi.map((item, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-teal text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <p className="pt-0.5 text-sm leading-relaxed text-neutral-espresso/90 sm:text-base">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-slate">
          {school.nama} — Tahun Ajaran {school.tahunAjaranAktif}
        </p>
      </section>
    </>
  );
}
