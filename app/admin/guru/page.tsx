import { getAllTeachersAdmin } from "@/lib/admin-guru-data";
import { TeacherManager } from "@/components/admin/TeacherManager";

export const metadata = { title: "Guru Manager" };

export default async function AdminGuruPage() {
  const teachers = await getAllTeachersAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Guru Manager
        </h1>
        <p className="text-sm text-neutral-slate">
          Kelola data guru & tenaga kependidikan, serta akun login mereka.
        </p>
      </div>
      <TeacherManager teachers={teachers} />
    </div>
  );
}
