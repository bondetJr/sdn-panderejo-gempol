import { getAllCommitteeMembersAdmin } from "@/lib/admin-profil-data";
import { CommitteeManager } from "@/components/admin/CommitteeManager";

export const metadata = { title: "Struktur Organisasi Manager" };

export default async function AdminStrukturPage() {
  const members = await getAllCommitteeMembersAdmin();
  return <CommitteeManager members={members} />;
}
