import { getAllAgendaAdmin } from "@/lib/admin-akademik-data";
import { AgendaManager } from "@/components/admin/AgendaManager";

export const metadata = { title: "Kalender Akademik Manager" };

export default async function AdminKalenderPage() {
  const agenda = await getAllAgendaAdmin();
  return <AgendaManager agenda={agenda} />;
}
