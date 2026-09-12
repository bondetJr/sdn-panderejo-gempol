import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Users2 } from "lucide-react";
import { getClassRoomWithStudentsAdmin } from "@/lib/admin-siswa-data";
import { StudentManager } from "@/components/admin/StudentManager";

export const metadata = { title: "Kelola Siswa Rombel" };

export default async function AdminRombelDetailPage({
  params,
}: {
  params: Promise<{ classRoomId: string }>;
}) {
  const { classRoomId } = await params;
  const classRoom = await getClassRoomWithStudentsAdmin(classRoomId);

  if (!classRoom) notFound();

  const jumlahL = classRoom.students.filter((s) => s.jenisKelamin === "L").length;
  const jumlahP = classRoom.students.filter((s) => s.jenisKelamin === "P").length;

  return (
    <div>
      <Link
        href="/admin/akademik/rombel"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-slate hover:text-primary-teal-deep"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Daftar Rombel
      </Link>

      {/* Ringkasan Kelas */}
      <div className="mb-6 overflow-hidden rounded-card bg-white shadow-soft">
        <div className="flex items-center gap-3 bg-primary-teal-deep px-6 py-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white">
            <Users2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white">
              Kelas {classRoom.nama}
            </h1>
            <p className="text-xs text-white/70">
              Tahun Ajaran {classRoom.tahunAjaran}
              {classRoom.waliKelas && ` · Wali Kelas: ${classRoom.waliKelas.nama}`}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-neutral-espresso/10">
          <div className="p-4 text-center">
            <p className="text-2xl font-extrabold text-neutral-espresso">
              {classRoom.students.length}
            </p>
            <p className="text-xs text-neutral-slate">Total Siswa</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-extrabold text-sky-700">{jumlahL}</p>
            <p className="text-xs text-neutral-slate">Laki-laki</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-extrabold text-rose-700">{jumlahP}</p>
            <p className="text-xs text-neutral-slate">Perempuan</p>
          </div>
        </div>
      </div>

      {/* Tabel & CRUD Siswa */}
      <StudentManager classRoomId={classRoom.id} students={classRoom.students} />
    </div>
  );
}
