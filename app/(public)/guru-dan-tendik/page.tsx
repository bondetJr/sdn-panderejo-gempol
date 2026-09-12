import { PageHeader } from "@/components/layout/PageHeader";
import { TeacherGrid } from "@/components/guru/TeacherGrid";
import { getAllTeachers } from "@/lib/teacher-data";

export const metadata = {
  title: "Data Guru & Tenaga Kependidikan",
};

export default async function GuruDanTendikPage() {
  const teachers = await getAllTeachers();

  return (
    <>
      <PageHeader
        title="Guru & Tenaga Kependidikan"
        description="Kenali kami para pendidik dan tenaga kependidikan yang berdedikasi membimbing putra-putri Bapak/Ibu."
        breadcrumbs={[{ label: "Guru & Tendik" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <TeacherGrid teachers={teachers} />
      </section>
    </>
  );
}
