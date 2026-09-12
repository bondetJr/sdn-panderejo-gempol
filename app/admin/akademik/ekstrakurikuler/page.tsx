import { getAllExtracurricularsAdmin, getTeachersForSelectAdmin } from "@/lib/admin-akademik-data";
import { ExtracurricularManager } from "@/components/admin/ExtracurricularManager";

export const metadata = { title: "Ekstrakurikuler Manager" };

export default async function AdminEkstrakurikulerPage() {
  const [items, teachers] = await Promise.all([
    getAllExtracurricularsAdmin(),
    getTeachersForSelectAdmin(),
  ]);
  return <ExtracurricularManager items={items} teachers={teachers} />;
}
