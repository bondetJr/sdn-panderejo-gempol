import {
  getKepalaSekolahAdmin,
  getAllTeachersForKepsekSelect,
} from "@/lib/admin-profil-data";
import { SambutanForm } from "@/components/admin/SambutanForm";

export const metadata = { title: "Sambutan Kepala Sekolah" };

export default async function AdminSambutanPage() {
  const [kepsek, teachers] = await Promise.all([
    getKepalaSekolahAdmin(),
    getAllTeachersForKepsekSelect(),
  ]);

  return (
    <SambutanForm
      teachers={teachers}
      currentKepsekId={kepsek?.id ?? null}
      currentSambutan={kepsek?.sambutanText ?? ""}
    />
  );
}
