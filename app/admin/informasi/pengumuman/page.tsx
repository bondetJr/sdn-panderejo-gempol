import { getAllAnnouncementsAdmin } from "@/lib/admin-informasi-data";
import { AnnouncementManager } from "@/components/admin/AnnouncementManager";

export const metadata = { title: "Pengumuman Manager" };

export default async function AdminPengumumanPage() {
  const announcements = await getAllAnnouncementsAdmin();
  return <AnnouncementManager announcements={announcements} />;
}
