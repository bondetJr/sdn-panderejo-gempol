import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

async function getNotifCount() {
  try {
    const [pesanBelumBaca, ppdbBaru] = await Promise.all([
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.ppdbApplicant.count({ where: { status: "MENUNGGU_VERIFIKASI" } }),
    ]);
    return pesanBelumBaca + ppdbBaru;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Lapisan pengaman tambahan selain middleware.ts (defense in depth)
  if (!session?.user) {
    redirect("/login");
  }

  const notifCount = await getNotifCount();

  return (
    <AdminShell
      userName={session.user.name ?? "Admin"}
      role={session.user.role}
      notifCount={notifCount}
    >
      {children}
    </AdminShell>
  );
}
