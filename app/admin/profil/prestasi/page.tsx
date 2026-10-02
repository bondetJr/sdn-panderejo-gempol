import { getAllAchievementsAdmin, getSchoolAdmin } from "@/lib/admin-profil-data";
import { AchievementManager } from "@/components/admin/AchievementManager";
import { AkreditasiForm } from "@/components/admin/AkreditasiForm";

export const metadata = { title: "Prestasi & Akreditasi" };

export default async function AdminPrestasiPage() {
  const [achievements, school] = await Promise.all([
    getAllAchievementsAdmin(),
    getSchoolAdmin(),
  ]);

  return (
    <div className="space-y-8">
      {/* Section Akreditasi */}
      {school && <AkreditasiForm school={school} />}

      {/* Section Prestasi */}
      <div>
        <h2 className="mb-4 text-base font-bold text-neutral-espresso">Daftar Prestasi</h2>
        <AchievementManager achievements={achievements} />
      </div>
    </div>
  );
}
