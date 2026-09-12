"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Anda harus login untuk melakukan aksi ini.");
  return session.user;
}

async function logAction(userId: string, action: string, detail?: string) {
  try {
    await prisma.adminActionLog.create({ data: { userId, action, detail } });
  } catch {
    /* no-op */
  }
}

// ---------------------------------------------------------------
// PESAN MASUK (ContactMessage)
// ---------------------------------------------------------------
export async function markMessageRead(id: string, isRead: boolean) {
  const user = await requireAdminSession();
  await prisma.contactMessage.update({ where: { id }, data: { isRead } });
  await logAction(user.id, "MARK_MESSAGE_READ", `${id} -> ${isRead}`);
  revalidatePath("/admin/kontak/pesan");
  return { success: true };
}

export async function deleteMessage(id: string) {
  const user = await requireAdminSession();
  await prisma.contactMessage.delete({ where: { id } });
  await logAction(user.id, "DELETE_MESSAGE", id);
  revalidatePath("/admin/kontak/pesan");
  return { success: true };
}

// ---------------------------------------------------------------
// MODERASI TESTIMONI (Testimonial)
// ---------------------------------------------------------------
export async function setTestimonialApproval(id: string, isApproved: boolean) {
  const user = await requireAdminSession();
  await prisma.testimonial.update({ where: { id }, data: { isApproved } });
  await logAction(user.id, "SET_TESTIMONIAL_APPROVAL", `${id} -> ${isApproved}`);
  revalidatePath("/admin/kontak/testimoni");
  revalidatePath("/kontak/buku-tamu");
  return { success: true };
}

export async function setTestimonialFeatured(id: string, isFeatured: boolean) {
  const user = await requireAdminSession();
  await prisma.testimonial.update({ where: { id }, data: { isFeatured } });
  await logAction(user.id, "SET_TESTIMONIAL_FEATURED", `${id} -> ${isFeatured}`);
  revalidatePath("/admin/kontak/testimoni");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  const user = await requireAdminSession();
  await prisma.testimonial.delete({ where: { id } });
  await logAction(user.id, "DELETE_TESTIMONIAL", id);
  revalidatePath("/admin/kontak/testimoni");
  revalidatePath("/kontak/buku-tamu");
  revalidatePath("/");
  return { success: true };
}
