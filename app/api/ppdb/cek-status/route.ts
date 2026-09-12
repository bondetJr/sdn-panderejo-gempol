import { NextResponse } from "next/server";
import { cekStatusSchema } from "@/lib/validations/ppdb";
import { checkPpdbStatus } from "@/lib/ppdb-data";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`cek-status:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });

  if (!success) {
    return NextResponse.json(
      {
        error:
          "Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit.",
      },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = cekStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Nomor pendaftaran atau NIK tidak valid." },
      { status: 400 }
    );
  }

  const result = await checkPpdbStatus(
    parsed.data.noPendaftaran,
    parsed.data.nik
  );

  if (!result) {
    // Sengaja pakai pesan generik — tidak membedakan "no. pendaftaran
    // salah" vs "NIK salah" supaya tidak bisa dipakai menebak data
    // pendaftar lain satu per satu.
    return NextResponse.json(
      {
        error:
          "Data tidak ditemukan. Pastikan Nomor Pendaftaran dan NIK yang dimasukkan sudah benar.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: result });
}
