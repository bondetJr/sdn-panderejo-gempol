import { getAllFacilitiesAdmin } from "@/lib/admin-profil-data";
import { FacilityManager } from "@/components/admin/FacilityManager";

export const metadata = { title: "Fasilitas Manager" };

export default async function AdminFasilitasPage() {
  const facilities = await getAllFacilitiesAdmin();
  return <FacilityManager facilities={facilities} />;
}
