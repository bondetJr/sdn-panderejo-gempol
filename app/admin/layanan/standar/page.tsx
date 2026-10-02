import { getAllServiceStandardsAdmin } from "@/lib/admin-layanan-data";
import { ServiceStandardManager } from "@/components/admin/ServiceStandardManager";

export const metadata = { title: "Standar Pelayanan" };

export default async function AdminLayananStandarPage() {
  const items = await getAllServiceStandardsAdmin();
  return <ServiceStandardManager items={items} />;
}
