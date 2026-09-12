import { auth } from "@/auth";
import { AdminPengaturanTabs } from "@/components/admin/AdminPengaturanTabs";

export default async function AdminPengaturanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Pengaturan
        </h1>
        <p className="text-sm text-neutral-slate">
          Kelola data sekolah dan akun pengguna sistem.
        </p>
      </div>
      <AdminPengaturanTabs isSuperAdmin={isSuperAdmin} />
      {children}
    </div>
  );
}
