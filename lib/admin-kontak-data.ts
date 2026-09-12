import { prisma } from "@/lib/prisma";

export async function getAllMessagesAdmin() {
  try {
    return await prisma.contactMessage.findMany({
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

export async function getAllTestimonialsAdmin() {
  try {
    return await prisma.testimonial.findMany({
      orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}
