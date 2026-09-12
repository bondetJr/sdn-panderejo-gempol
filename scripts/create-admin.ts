/**
 * Script CLI untuk membuat akun admin pertama.
 * Dijalankan manual karena sengaja TIDAK ada halaman registrasi
 * publik — akun hanya dibuat oleh Super Admin (lewat script ini
 * di awal, atau lewat Dashboard Admin > Pengaturan setelahnya).
 *
 * Cara pakai:
 *   npx tsx scripts/create-admin.ts "Nama Admin" admin@sekolah.sch.id passwordRahasia123 SUPER_ADMIN
 */
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const [, , name, email, password, role] = process.argv;

  if (!name || !email || !password) {
    console.error(
      "Penggunaan: npx tsx scripts/create-admin.ts \"Nama\" email@sekolah.sch.id password [SUPER_ADMIN|KEPALA_SEKOLAH|OPERATOR|GURU]"
    );
    process.exit(1);
  }

  const validRoles = ["SUPER_ADMIN", "KEPALA_SEKOLAH", "OPERATOR", "GURU"];
  const finalRole = validRoles.includes(role) ? role : "SUPER_ADMIN";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`Gagal: email ${email} sudah terdaftar.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: finalRole as "SUPER_ADMIN" | "KEPALA_SEKOLAH" | "OPERATOR" | "GURU",
    },
  });

  console.log(`✅ Akun berhasil dibuat:`);
  console.log(`   Nama  : ${user.name}`);
  console.log(`   Email : ${user.email}`);
  console.log(`   Role  : ${user.role}`);
  console.log(`\nSilakan login di /login dengan email & password yang baru saja dibuat.`);
}

main()
  .catch((err) => {
    console.error("Gagal membuat akun:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
