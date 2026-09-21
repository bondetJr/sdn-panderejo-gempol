import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AppRole = "SUPER_ADMIN" | "KEPALA_SEKOLAH" | "OPERATOR" | "GURU";

export const OPERATOR_PLUS: AppRole[] = [
  "SUPER_ADMIN",
  "KEPALA_SEKOLAH",
  "OPERATOR",
];
export const STAFF_ANY: AppRole[] = [
  "SUPER_ADMIN",
  "KEPALA_SEKOLAH",
  "OPERATOR",
  "GURU",
];

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Anda harus login untuk melakukan aksi ini.");
  }
  return session.user as {
    id: string;
    name: string;
    email: string;
    role: AppRole;
  };
}

export async function requireRole(allowedRoles: AppRole[]) {
  const user = await requireAdminSession();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Aksi ini hanya boleh dilakukan oleh: ${allowedRoles.join(", ")}.`
    );
  }
  return user;
}

export async function requireSuperAdmin() {
  return requireRole(["SUPER_ADMIN"]);
}

export async function logAction(userId: string, action: string, detail?: string) {
  try {
    await prisma.adminActionLog.create({ data: { userId, action, detail } });
  } catch (err) {
    console.error(`Gagal mencatat AdminActionLog (${action}):`, err);
  }
}
