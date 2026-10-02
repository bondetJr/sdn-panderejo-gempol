import { getAllProgramsAdmin } from "@/lib/admin-profil-data";
import { ProgramManager } from "@/components/admin/ProgramManager";

export const metadata = { title: "Program Unggulan" };

export default async function AdminProgramUnggulanPage() {
  const programs = await getAllProgramsAdmin();
  return <ProgramManager programs={programs} />;
}
