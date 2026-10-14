import { Eye, Target, History, Quote, Sparkles } from "lucide-react";
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
      visi: "Terwujudnya peserta didik yang religius, berakhlak mulia, cerdas, mandiri, dan peduli lingkungan.",
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

async function getSejarah() {
  try {
    const school = await prisma.school.findFirst();
    return (
      school?.sejarah ??
      `SD Negeri Panderejo Gempol berdiri sebagai salah satu lembaga pendidikan dasar negeri yang melayani masyarakat Desa Panderejo dan sekitarnya di Kecamatan Gempol, Kabupaten Pasuruan.

Sejak awal berdiri, sekolah ini berkomitmen menghadirkan pendidikan dasar yang berkualitas, terjangkau, dan berlandaskan nilai-nilai keagamaan serta budaya lokal. Dari tahun ke tahun, sekolah terus berbenah — baik dari sisi sarana prasarana, kualitas tenaga pendidik, maupun capaian prestasi peserta didik.

Hingga saat ini, sekolah terus bertransformasi mengikuti perkembangan zaman, termasuk dalam penerapan Kurikulum Merdeka dan digitalisasi layanan administrasi sekolah, tanpa meninggalkan nilai-nilai karakter dan kearifan lokal yang menjadi ciri khasnya.

[Catatan: Narasi sejarah lengkap — termasuk tahun berdiri, nama kepala sekolah pertama, dan tonggak penting lainnya — mohon dilengkapi oleh pihak sekolah melalui Dashboard Admin > Profil > Identitas.]`
    );
  } catch {
    return "[Narasi sejarah sekolah akan ditampilkan di sini setelah diisi melalui Dashboard Admin.]";
  }
}

export default async function VisiMisiSejarahPage() {
  const school = await getSchoolProfile();
  const { visi, misi } = await getVisiMisi();
  const sejarah = await getSejarah();
  const paragraphs = sejarah.split("\n").filter(Boolean);

  return (
    <>
      <PageHeader
        title="Visi, Misi & Sejarah"
        description={`Mengenal jati diri, tujuan, dan perjalanan ${school.nama} — fondasi yang menuntun setiap langkah pendidikan kami.`}
        breadcrumbs={[
          { label: "Profil Sekolah", href: "/profil" },
          { label: "Visi, Misi & Sejarah" },
        ]}
      />

      {/* Premium layout - proporsi & white space */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* VISI - Hero statement */}
        <div className="relative">
          <div className="mb-8 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-espresso/10 bg-white px-3 py-1.5 shadow-soft">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary-teal" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-espresso">Visi Sekolah</span>
            </span>
            <span className="hidden h-px w-12 bg-neutral-espresso/10 sm:block" />
            <span className="text-[11px] font-semibold text-neutral-slate/60">Arah & cita-cita</span>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-white shadow-soft ring-1 ring-neutral-espresso/[0.06]">
            {/* Subtle abstract gradient - ekosistem warna */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a5c5c]/[0.06] via-[#1db5a8]/[0.04] to-[#fbe49d]/[0.14]" />
            <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#1db5a8]/[0.08] blur-[32px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#fbe49d]/[0.22] blur-[28px]" />
            
            <div className="relative p-7 sm:p-10 lg:p-12">
              <div className="flex items-start justify-between gap-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-teal-deep text-white shadow-soft">
                  <Eye className="h-6 w-6" />
                </span>
                <Quote className="hidden h-8 w-8 text-neutral-espresso/[0.06] sm:block" />
              </div>

              <blockquote className="mt-8 max-w-3xl">
                <p className="text-[20px] font-extrabold leading-[1.35] tracking-tight text-neutral-espresso sm:text-[26px] sm:leading-[1.3] lg:text-[28px]">
                  &ldquo;{visi}&rdquo;
                </p>
              </blockquote>

              <div className="mt-8 flex items-center gap-3 border-t border-neutral-espresso/[0.06] pt-6">
                <div className="flex -space-x-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-joy-butter text-[11px] font-bold text-neutral-espresso ring-2 ring-white">V</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-teal-light text-[11px] font-bold text-primary-teal-deep ring-2 ring-white">I</span>
                </div>
                <p className="text-[12px] leading-relaxed text-neutral-slate">
                  Visi ini menjadi kompas untuk <span className="font-bold text-neutral-espresso">{school.nama}</span> dalam mendidik generasi yang berkarakter dan berprestasi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MISI - Structured grid */}
        <div className="mt-16 sm:mt-20">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-espresso/10 bg-white px-3 py-1.5 shadow-soft">
                <Target className="h-3.5 w-3.5 text-primary-teal-deep" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-espresso">Misi Sekolah</span>
              </div>
              <h2 className="mt-4 text-[22px] font-extrabold leading-tight tracking-tight text-neutral-espresso sm:text-[26px]">
                Langkah nyata <br className="hidden sm:block" />
                mewujudkan visi
              </h2>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-neutral-slate sm:text-[14px]">
                Enam komitmen utama yang kami jalankan setiap hari di kelas, di lapangan, dan di lingkungan sekolah.
              </p>
            </div>
            <span className="hidden items-center gap-2 text-[11px] font-semibold text-neutral-slate/50 sm:inline-flex">
              <span className="h-px w-8 bg-neutral-espresso/10" />
              {misi.length} poin utama
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {misi.map((item, idx) => (
              <div
                key={idx}
                className="group relative flex gap-4 rounded-[20px] bg-white p-5 shadow-soft ring-1 ring-neutral-espresso/[0.05] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(10,92,92,0.10)] hover:ring-primary-teal/20 sm:p-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-base-cloud text-[13px] font-extrabold text-primary-teal-deep ring-1 ring-neutral-espresso/[0.06] transition-colors group-hover:bg-primary-teal-deep group-hover:text-white">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="pt-1 text-[14px] font-medium leading-[1.6] text-neutral-espresso/85">
                  {item}
                </p>
                <span className="pointer-events-none absolute bottom-4 right-5 text-[11px] font-bold text-neutral-espresso/[0.06] group-hover:text-neutral-espresso/[0.10]">{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SEJARAH - Premium prose */}
        <div className="mt-16 sm:mt-20">
          <div className="mb-8 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-espresso/10 bg-white px-3 py-1.5 shadow-soft">
              <History className="h-3.5 w-3.5 text-primary-teal-deep" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-espresso">Sejarah</span>
            </span>
            <span className="h-px w-12 bg-neutral-espresso/10" />
            <span className="text-[11px] font-semibold text-neutral-slate/60">Perjalanan & transformasi</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            {/* Main prose */}
            <div className="rounded-[24px] bg-white p-7 shadow-soft ring-1 ring-neutral-espresso/[0.06] sm:p-9 lg:p-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-espresso text-white">
                  <History className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-[18px] font-extrabold tracking-tight text-neutral-espresso">Sejarah Sekolah</h2>
                  <p className="text-[12px] font-semibold text-neutral-slate">{school.nama}</p>
                </div>
              </div>

              <div className="space-y-5">
                {paragraphs.map((p, idx) => (
                  <p
                    key={idx}
                    className={`leading-[1.8] text-neutral-espresso/80 ${
                      idx === 0 ? "text-[15px] font-medium text-neutral-espresso sm:text-[16px]" : "text-[14px] sm:text-[15px]"
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-3 rounded-2xl bg-base-cloud p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-soft">
                  <Sparkles className="h-4 w-4 text-primary-teal-deep" />
                </span>
                <p className="text-[12px] leading-relaxed text-neutral-slate">
                  <span className="font-bold text-neutral-espresso">{school.nama}</span> — {school.kecamatan}, {school.kabupaten}. Terus berbenah untuk pendidikan yang relevan dengan zaman.
                </p>
              </div>
            </div>

            {/* Sidebar - timeline / highlight */}
            <div className="space-y-4">
              <div className="rounded-[20px] bg-primary-teal-deep p-6 text-white shadow-soft sm:p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Fokus Saat Ini</p>
                <h3 className="mt-3 text-[16px] font-extrabold leading-snug">Transformasi Kurikulum Merdeka & Digitalisasi Layanan</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-white/70">
                  Tanpa meninggalkan nilai karakter dan kearifan lokal yang menjadi identitas sekolah sejak awal berdiri.
                </p>
                <div className="mt-5 flex gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold">Kurikulum Merdeka</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold">Digitalisasi</span>
                </div>
              </div>

              <div className="rounded-[20px] bg-joy-butter/60 p-6 shadow-soft ring-1 ring-neutral-espresso/[0.06] sm:p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-espresso/60">Nilai Inti</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Religius", "Berakhlak Mulia", "Cerdas", "Mandiri", "Peduli Lingkungan"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-neutral-espresso shadow-soft">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-[12px] leading-relaxed text-neutral-espresso/70">
                  Lima kata kunci yang dirangkum dari visi sekolah, menjadi budaya sehari-hari di kelas dan di lingkungan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
