import { getSchoolSettingsAdmin } from "@/lib/admin-pengaturan-data";
import { SchoolSettingsForm } from "@/components/admin/SchoolSettingsForm";

export const metadata = { title: "Data Sekolah" };

export default async function AdminSekolahSettingsPage() {
  const school = await getSchoolSettingsAdmin();

  if (!school) {
    return (
      <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
        Gagal memuat data sekolah.
      </div>
    );
  }

  return <SchoolSettingsForm school={school} />;
}
