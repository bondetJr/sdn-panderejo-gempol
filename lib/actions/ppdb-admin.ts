"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Anda harus login untuk melakukan aksi ini.");
  }
  return session.user;
}

async function logAction(userId: string, action: string, detail?: string) {
  try {
    await prisma.adminActionLog.create({ data: { userId, action, detail } });
  } catch {
    // Logging gagal tidak boleh menggagalkan aksi utama
  }
}

// ---------------------------------------------------------------
// UBAH STATUS PENDAFTAR (Verifikasi / Terima / Tolak / Cadangan)
// ---------------------------------------------------------------
export async function updateApplicantStatus(
  applicantId: string,
  status: "MENUNGGU_VERIFIKASI" | "DIVERIFIKASI" | "DITERIMA" | "CADANGAN" | "DITOLAK",
  catatanVerifikasi: string
) {
  const user = await requireAdminSession();

  await prisma.ppdbApplicant.update({
    where: { id: applicantId },
    data: {
      status,
      catatanVerifikasi: catatanVerifikasi || null,
      verifiedAt: new Date(),
    },
  });

  await logAction(
    user.id,
    "UPDATE_STATUS_PPDB",
    `Applicant ${applicantId} -> ${status}`
  );

  revalidatePath("/admin/ppdb");
  revalidatePath(`/admin/ppdb/${applicantId}`);

  return { success: true };
}

// ---------------------------------------------------------------
// TOGGLE VERIFIKASI DOKUMEN (per file KK/Akta/KTP/dst)
// ---------------------------------------------------------------
export async function toggleDocumentVerified(
  documentId: string,
  applicantId: string,
  isVerified: boolean
) {
  const user = await requireAdminSession();

  await prisma.ppdbDocument.update({
    where: { id: documentId },
    data: { isVerified },
  });

  await logAction(
    user.id,
    "VERIFIKASI_DOKUMEN_PPDB",
    `Document ${documentId} -> ${isVerified ? "terverifikasi" : "batal verifikasi"}`
  );

  revalidatePath(`/admin/ppdb/${applicantId}`);

  return { success: true };
}

// ---------------------------------------------------------------
// CRUD GELOMBANG PPDB (PpdbWave)
// ---------------------------------------------------------------
export type WaveFormInput = {
  id?: string;
  tahunAjaran: string;
  jalur: "ZONASI" | "AFIRMASI" | "PERPINDAHAN";
  kuota: number;
  syaratText: string;
  tanggalBuka: string; // ISO date string dari <input type="date">
  tanggalTutup: string;
  isActive: boolean;
};

export async function upsertPpdbWave(input: WaveFormInput) {
  const user = await requireAdminSession();

  const data = {
    tahunAjaran: input.tahunAjaran,
    jalur: input.jalur,
    kuota: input.kuota,
    syaratText: input.syaratText,
    tanggalBuka: new Date(input.tanggalBuka),
    tanggalTutup: new Date(input.tanggalTutup),
    isActive: input.isActive,
  };

  if (input.id) {
    await prisma.ppdbWave.update({ where: { id: input.id }, data });
    await logAction(user.id, "UPDATE_GELOMBANG_PPDB", input.id);
  } else {
    await prisma.ppdbWave.create({ data: { ...data, kuotaTerisi: 0 } });
    await logAction(user.id, "CREATE_GELOMBANG_PPDB", input.tahunAjaran);
  }

  revalidatePath("/admin/ppdb/gelombang");
  revalidatePath("/ppdb/informasi");

  return { success: true };
}

export async function togglePpdbWaveActive(id: string, isActive: boolean) {
  const user = await requireAdminSession();

  await prisma.ppdbWave.update({ where: { id }, data: { isActive } });
  await logAction(user.id, "TOGGLE_GELOMBANG_PPDB", `${id} -> ${isActive}`);

  revalidatePath("/admin/ppdb/gelombang");
  revalidatePath("/ppdb/informasi");

  return { success: true };
}
