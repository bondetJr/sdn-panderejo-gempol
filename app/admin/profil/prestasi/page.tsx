import { getAllAchievementsAdmin } from "@/lib/admin-profil-data";
import { AchievementManager } from "@/components/admin/AchievementManager";

export const metadata = { title: "Prestasi Manager" };

export default async function AdminPrestasiPage() {
  const achievements = await getAllAchievementsAdmin();
  return <AchievementManager achievements={achievements} />;
}
