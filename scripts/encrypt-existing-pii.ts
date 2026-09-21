/**
 * Script SEKALI JALAN untuk mengenkripsi NIK & No. HP Orang Tua yang
 * masih tersimpan sebagai teks biasa di database.
 *
 * WAJIB dijalankan SETELAH migration yang menambahkan kolom
 * nikEncrypted/nikHash/noHpOrtuEncrypted, dan SEBELUM migration yang
 * menghapus kolom nik/noHpOrtu lama.
 *
 * Cara pakai:
 *   npx tsx scripts/encrypt-existing-pii.ts
 *
 * PENTING: pastikan PII_ENCRYPTION_KEY & PII_HASH_KEY di .env sudah
 * di-set SEBELUM menjalankan ini, dan JANGAN diganti setelahnya —
 * kalau key berubah, data yang sudah dienkripsi dengan key lama
 * tidak bisa didekripsi lagi.
 */
import { PrismaClient } from "@prisma/client";
import { encryptPii, hashPiiForLookup } from "../lib/crypto/pii";

const prisma = new PrismaClient();

async function backfillStudents() {
  const students: { id: string; nik: string | null }[] =
    await prisma.$queryRaw`SELECT id, nik FROM "Student" WHERE nik IS NOT NULL AND "nikEncrypted" IS NULL`;

  console.log(`📋 ${students.length} data siswa perlu dienkripsi.`);

  for (const student of students) {
    if (!student.nik) continue;
    await prisma.student.update({
      where: { id: student.id },
      data: {
        nikEncrypted: encryptPii(student.nik),
        nikHash: hashPiiForLookup(student.nik),
      },
    });
    console.log(`  ✅ Siswa ${student.id}`);
  }
}

async function backfillPpdbApplicants() {
  const applicants: { id: string; nik: string; noHpOrtu: string }[] =
    await prisma.$queryRaw`SELECT id, nik, "noHpOrtu" FROM "PpdbApplicant" WHERE "nikEncrypted" IS NULL`;

  console.log(`📋 ${applicants.length} data pendaftar PPDB perlu dienkripsi.`);

  for (const applicant of applicants) {
    await prisma.ppdbApplicant.update({
      where: { id: applicant.id },
      data: {
        nikEncrypted: encryptPii(applicant.nik),
        nikHash: hashPiiForLookup(applicant.nik),
        noHpOrtuEncrypted: encryptPii(applicant.noHpOrtu),
      },
    });
    console.log(`  ✅ Pendaftar ${applicant.id}`);
  }
}

async function main() {
  await backfillStudents();
  await backfillPpdbApplicants();
  console.log("\n🎉 Backfill selesai. Cek beberapa data secara manual sebelum menghapus kolom lama.");
}

main()
  .catch((err) => {
    console.error("❌ Backfill gagal:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
