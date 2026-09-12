import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validations/kontak";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`kontak-pesan:${ip}`, {
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
  const parsed = contactMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data yang dikirim tidak valid.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await prisma.contactMessage.create({
      data: {
        nama: parsed.data.nama,
        email: parsed.data.email || null,
        telepon: parsed.data.telepon || null,
        subjek: parsed.data.subjek,
        pesan: parsed.data.pesan,
        isPengaduan: parsed.data.isPengaduan ?? false,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gagal simpan pesan kontak:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
