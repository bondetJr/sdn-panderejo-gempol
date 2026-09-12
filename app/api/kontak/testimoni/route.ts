import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations/kontak";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`kontak-testimoni:${ip}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!success) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Silakan coba lagi sebentar lagi." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data yang dikirim tidak valid.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await prisma.testimonial.create({
      data: {
        nama: parsed.data.nama,
        peran: parsed.data.peran,
        pesan: parsed.data.pesan,
        rating: parsed.data.rating,
        isApproved: false, // wajib dimoderasi admin dulu sebelum tampil publik
        isFeatured: false,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gagal simpan testimoni:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
