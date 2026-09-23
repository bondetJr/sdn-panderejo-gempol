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

// ---------------------------------------------------------------
// KELOLA FAQ (Faq) - BARU
// ---------------------------------------------------------------
export async function createFaq(data: { pertanyaan: string; jawaban: string; urutan?: number }) {
  const user = await requireRole(STAFF_ANY);
  
  if (!data.pertanyaan?.trim() || !data.jawaban?.trim()) {
    return { success: false, error: "Pertanyaan dan jawaban wajib diisi" };
  }

  const faq = await prisma.faq.create({
    data: {
      pertanyaan: data.pertanyaan.trim(),
      jawaban: data.jawaban.trim(),
      urutan: data.urutan ?? 0,
    },
  });

  await logAction(user.id, "CREATE_FAQ", faq.id);
  revalidatePath("/admin/kontak/faq");
  revalidatePath("/kontak/faq");
  return { success: true, data: faq };
}

export async function updateFaq(id: string, data: { pertanyaan: string; jawaban: string; urutan?: number }) {
  const user = await requireRole(STAFF_ANY);

  if (!data.pertanyaan?.trim() || !data.jawaban?.trim()) {
    return { success: false, error: "Pertanyaan dan jawaban wajib diisi" };
  }

  const faq = await prisma.faq.update({
    where: { id },
    data: {
      pertanyaan: data.pertanyaan.trim(),
      jawaban: data.jawaban.trim(),
      urutan: data.urutan ?? 0,
    },
  });

  await logAction(user.id, "UPDATE_FAQ", id);
  revalidatePath("/admin/kontak/faq");
  revalidatePath("/kontak/faq");
  return { success: true, data: faq };
}

export async function deleteFaq(id: string) {
  const user = await requireRole(STAFF_ANY);
  await prisma.faq.delete({ where: { id } });
  await logAction(user.id, "DELETE_FAQ", id);
  revalidatePath("/admin/kontak/faq");
  revalidatePath("/kontak/faq");
  return { success: true };
}

export async function reorderFaqs(orderedIds: string[]) {
  const user = await requireRole(STAFF_ANY);
  
  // Update urutan berdasarkan index
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.faq.update({
        where: { id },
        data: { urutan: index },
      })
    )
  );

  await logAction(user.id, "REORDER_FAQ", orderedIds.join(","));
  revalidatePath("/admin/kontak/faq");
  revalidatePath("/kontak/faq");
  return { success: true };
}
