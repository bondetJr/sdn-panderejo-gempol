import { ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { getAllUsersAdmin } from "@/lib/admin-pengaturan-data";
import { UserManager } from "@/components/admin/UserManager";

export const metadata = { title: "Kelola Pengguna" };

export default async function AdminUsersPage() {
  const session = await auth();

  if (session?.user.role !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center rounded-card bg-white p-12 text-center shadow-soft">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-base font-bold text-neutral-espresso">
          Akses Terbatas
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-neutral-slate">
          Halaman Kelola Pengguna hanya dapat diakses oleh akun dengan role
          Super Admin. Hubungi Super Admin sekolah jika Anda memerlukan akses.
        </p>
      </div>
    );
  }

  const users = await getAllUsersAdmin();

  return <UserManager users={users} currentUserId={session.user.id} />;
}
