"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logAction, requireRole, STAFF_ANY } from "@/lib/guards";

// ---------------------------------------------------------------
// PESAN MASUK (ContactMessage)
// ---------------------------------------------------------------
export async function markMessageRead(id: string, isRead: boolean) {
  const user = await requireRole(STAFF_ANY);
  await prisma.contactMessage.update({ where: { id }, data: { isRead } });
  await logAction(user.id, "MARK_MESSAGE_READ", `${id} -> ${isRead}`);
  revalidatePath("/admin/kontak/pesan");
  return { success: true };
}

export async function deleteMessage(id: string) {
  const user = await requireRole(STAFF_ANY);
  await prisma.contactMessage.delete({ where: { id } });
  await logAction(user.id, "DELETE_MESSAGE", id);
  revalidatePath("/admin/kontak/pesan");
  return { success: true };
}

// ---------------------------------------------------------------
// MODERASI TESTIMONI (Testimonial)
// ---------------------------------------------------------------
export async function setTestimonialApproval(id: string, isApproved: boolean) {
  const user = await requireRole(STAFF_ANY);
  await prisma.testimonial.update({ where: { id }, data: { isApproved } });
  await logAction(user.id, "SET_TESTIMONIAL_APPROVAL", `${id} -> ${isApproved}`);
  revalidatePath("/admin/kontak/testimoni");
  revalidatePath("/kontak/buku-tamu");
  return { success: true };
}

export async function setTestimonialFeatured(id: string, isFeatured: boolean) {
  const user = await requireRole(STAFF_ANY);
  await prisma.testimonial.update({ where: { id }, data: { isFeatured } });
  await logAction(user.id, "SET_TESTIMONIAL_FEATURED", `${id} -> ${isFeatured}`);
  revalidatePath("/admin/kontak/testimoni");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  const user = await requireRole(STAFF_ANY);
  await prisma.testimonial.delete({ where: { id } });
  await logAction(user.id, "DELETE_TESTIMONIAL", id);
  revalidatePath("/admin/kontak/testimoni");
  revalidatePath("/kontak/buku-tamu");
  revalidatePath("/");
  return { success: true };
}
