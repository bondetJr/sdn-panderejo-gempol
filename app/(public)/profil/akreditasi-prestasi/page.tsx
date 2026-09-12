import { ShieldCheck, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AchievementGrid } from "@/components/profil/AchievementGrid";
import { getSchoolProfile } from "@/lib/school";
import { getAchievements } from "@/lib/profil-data";

export default async function AkreditasiPrestasiPage() {
  const school = await getSchoolProfile();
  const achievements = await getAchievements();

  return (
    <>
      <PageHeader
        title="Akreditasi & Prestasi"
        breadcrumbs={[
          { label: "Profil Sekolah", href: "/profil" },
          { label: "Akreditasi & Prestasi" },
        ]}
      />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Akreditasi */}
        <div className="flex flex-col items-center gap-5 rounded-card bg-white p-8 text-center shadow-soft sm:flex-row sm:text-left">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-teal text-white">
            <ShieldCheck className="h-8 w-8" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-slate">
              Status Akreditasi Sekolah
            </p>
            <p className="mt-1 text-3xl font-extrabold text-primary-teal-deep">
              {school.akreditasi ?? "-"}
            </p>
            <p className="mt-1 text-sm text-neutral-slate">
              Terakreditasi oleh Badan Akreditasi Nasional Sekolah/Madrasah
              (BAN-S/M) Tahun 2021
            </p>
          </div>
        </div>

        {/* Prestasi */}
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-joy-butter/60 text-neutral-espresso">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-neutral-espresso">
                Daftar Prestasi
              </h2>
              <p className="text-xs text-neutral-slate">
                Klik salah satu prestasi untuk melihat dokumentasi fotonya.
              </p>
            </div>
          </div>

          {achievements.length === 0 ? (
            <div className="mt-4 rounded-card bg-white p-8 text-center shadow-soft">
              <p className="text-sm text-neutral-slate">
                Belum ada data prestasi yang ditambahkan.
              </p>
            </div>
          ) : (
            <AchievementGrid achievements={achievements} />
          )}
        </div>
      </section>
    </>
  );
}
