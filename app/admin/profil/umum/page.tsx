import { getSchoolAdmin } from "@/lib/admin-profil-data";
import { SchoolProfileForm } from "@/components/admin/SchoolProfileForm";

export const metadata = { title: "Profil Umum Sekolah" };

export default async function AdminProfilUmumPage() {
  const school = await getSchoolAdmin();

  if (!school) {
    return (
      <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
        Gagal memuat data sekolah. Pastikan database sudah terkoneksi.
      </div>
    );
  }

  return <SchoolProfileForm school={school} />;
}
