import { AdminProfilTabs } from "@/components/admin/AdminProfilTabs";

export default function AdminProfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Profil Manager
        </h1>
        <p className="text-sm text-neutral-slate">
          Kelola profil, sambutan, fasilitas, dan prestasi sekolah.
        </p>
      </div>
      <AdminProfilTabs />
      {children}
    </div>
  );
}
