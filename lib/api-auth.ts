import { auth } from "@/auth";
import { NextResponse } from "next/server";

type Role = "SUPER_ADMIN" | "KEPALA_SEKOLAH" | "OPERATOR" | "GURU";

/**
 * Wajib login. Return session kalau lolos, atau NextResponse 401 kalau tidak.
 * Pakai di SEMUA route admin yang mengubah data (POST/PATCH/PUT/DELETE).
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized. Silakan login." }, { status: 401 }),
    };
  }
  return { session, error: null };
}

/**
 * Wajib login DAN role tertentu. Contoh: hanya SUPER_ADMIN boleh hapus guru.
 */
export async function requireRole(allowedRoles: Role[]) {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };

  const role = (session!.user as { role: Role }).role as Role;
  if (!allowedRoles.includes(role)) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Kamu tidak punya izin untuk melakukan aksi ini." },
        { status: 403 }
      ),
    };
  }
  return { session, error: null };
}

/**
 * Catat setiap aksi sensitif ke AdminActionLog — supaya kalau ada
 * data hilang/berubah, ketahuan siapa pelakunya dan kapan.
 */
export async function logAdminAction(
  prisma: { adminActionLog: { create: (args: { data: { userId: string; action: string; detail?: string } }) => Promise<unknown> } },
  userId: string,
  action: string,
  detail?: string
) {
  await prisma.adminActionLog
    .create({ data: { userId, action, detail } })
    .catch((err: unknown) => console.error("Gagal mencatat AdminActionLog:", err));
}