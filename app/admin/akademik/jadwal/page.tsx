import { getAllScheduleSlotsAdmin } from "@/lib/admin-akademik-data";
import { ScheduleSlotManager } from "@/components/admin/ScheduleSlotManager";

export const metadata = { title: "Jadwal Pelajaran Manager" };

export default async function AdminJadwalPage() {
  const slots = await getAllScheduleSlotsAdmin();
  return <ScheduleSlotManager slots={slots} />;
}
