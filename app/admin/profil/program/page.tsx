import { getAllProgramsAdmin } from "@/lib/admin-profil-data";
import { ProgramManager } from "@/components/admin/ProgramManager";

export const metadata = { title: "Program Unggulan Manager" };

export default async function AdminProgramPage() {
  const programs = await getAllProgramsAdmin();
  return <ProgramManager programs={programs} />;
}
