/**
 * SEED DATA — SDN PANDEREJO GEMPOL
 * -------------------------------------------------------
 * Jalankan: npm run prisma:seed
 *
 * Data di file ini adalah DATA CONTOH untuk development/demo.
 * SEMUA data (nama guru, siswa, dsb) adalah FIKTIF — ganti dengan
 * data asli sekolah melalui Dashboard Admin setelah aplikasi jalan.
 *
 * ⚠️ PENTING: Akun Super Admin yang dibuat di sini pakai password
 * default yang TERTULIS DI FILE INI. Ini HANYA untuk kebutuhan
 * development lokal. JANGAN pernah jalankan seed ini di database
 * production dengan password default — ganti dulu, atau lebih
 * aman pakai `npm run create-admin` untuk buat akun production.
 * -------------------------------------------------------
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding...\n");

  // ---------------------------------------------------------------
  // 1. SCHOOL
  // ---------------------------------------------------------------
  await prisma.school.deleteMany();
  const school = await prisma.school.create({
    data: {
      nama: "SD Negeri Panderejo Gempol",
      npsn: "20519616",
      tagline: "Belajar Seru, Karakter Kuat, Berakhlak Mulia",
      alamat: "Jl. Raya Panderejo, Desa Panderejo, Kec. Gempol",
      desa: "Panderejo",
      kecamatan: "Gempol",
      kabupaten: "Pasuruan",
      provinsi: "Jawa Timur",
      telepon: "(0343) 851234",
      email: "sdnpanderejogempol@gmail.com",
      visi:
        "Terwujudnya peserta didik yang religius, berakhlak mulia, cerdas, mandiri, dan peduli lingkungan.",
      misi: [
        "Menanamkan nilai-nilai keagamaan dan akhlak mulia dalam kehidupan sehari-hari.",
        "Menyelenggarakan pembelajaran yang aktif, kreatif, efektif, dan menyenangkan.",
        "Mengembangkan budaya literasi dan numerasi sejak dini.",
        "Membiasakan pola hidup bersih, sehat, dan peduli terhadap lingkungan.",
        "Mengembangkan potensi peserta didik di bidang akademik maupun non-akademik.",
        "Membangun kerja sama yang baik antara sekolah, orang tua, dan masyarakat.",
      ].join("\n"),
      sejarah:
        "SD Negeri Panderejo Gempol berdiri sebagai lembaga pendidikan dasar negeri yang melayani masyarakat Desa Panderejo dan sekitarnya.\nSejak awal berdiri, sekolah berkomitmen menghadirkan pendidikan dasar berkualitas berlandaskan nilai keagamaan dan kearifan lokal.\nHingga kini, sekolah terus bertransformasi mengikuti perkembangan zaman, termasuk penerapan Kurikulum Merdeka dan digitalisasi layanan sekolah.",
      akreditasi: "A",
      akreditasiTahun: 2023,
      tahunAjaranAktif: "2026/2027",
      jamLayanan: "Senin - Jumat, 07.30 - 13.00 WIB",
    },
  });
  console.log("✅ School:", school.nama);

  // ---------------------------------------------------------------
  // 2. GURU & TENDIK
  // ---------------------------------------------------------------
  await prisma.teacher.deleteMany();
  const kepsek = await prisma.teacher.create({
    data: {
      nama: "Drs. Bambang Sutrisno, M.Pd.",
      nip: "196805121994031005",
      jabatan: "Kepala Sekolah",
      statusKepegawaian: "PNS",
      isKepalaSekolah: true,
      sambutanText:
        "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nPuji syukur kami panjatkan kehadirat Allah SWT atas rahmat-Nya sehingga SD Negeri Panderejo Gempol dapat terus berkomitmen memberikan layanan pendidikan terbaik bagi putra-putri Bapak/Ibu.\n\nKami berupaya membentuk generasi yang religius, berakhlak mulia, cerdas, dan berkarakter melalui berbagai program unggulan sekolah.\n\nSemoga website ini bermanfaat. Terima kasih atas kepercayaan Bapak/Ibu kepada kami.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.",
      tanggalMasuk: new Date("1994-03-01"),
    },
  });

  const waliKelas1A = await prisma.teacher.create({
    data: {
      nama: "Siti Aminah, S.Pd.",
      nip: "198501012010012001",
      jabatan: "Guru Kelas 1A",
      statusKepegawaian: "PNS",
      mapelDiampu: "Guru Kelas",
    },
  });

  const waliKelas2A = await prisma.teacher.create({
    data: {
      nama: "Ahmad Yusuf, S.Pd.",
      nuptk: "1234567890123456",
      jabatan: "Guru Kelas 2A",
      statusKepegawaian: "PPPK",
      mapelDiampu: "Guru Kelas",
    },
  });

  const guruPjok = await prisma.teacher.create({
    data: {
      nama: "Agus Setiawan, S.Pd.",
      jabatan: "Guru PJOK",
      statusKepegawaian: "HONORER",
      mapelDiampu: "PJOK",
    },
  });

  const guruAgama = await prisma.teacher.create({
    data: {
      nama: "Muhammad Fauzi, S.Pd.I.",
      nuptk: "3234567890123456",
      jabatan: "Guru PAI",
      statusKepegawaian: "PPPK",
      mapelDiampu: "Pendidikan Agama Islam",
    },
  });

  console.log("✅ Guru & Tendik: 5 data");

  // ---------------------------------------------------------------
  // 3. USER (Akun Login) — hanya 1 Super Admin untuk mulai
  // ---------------------------------------------------------------
  await prisma.user.deleteMany();
  const defaultPassword = "GantiSegera123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@sdnpanderejogempol.sch.id",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(
    `✅ User: admin@sdnpanderejogempol.sch.id (password: ${defaultPassword} — GANTI SEGERA setelah login pertama!)`
  );

  // ---------------------------------------------------------------
  // 4. ROMBONGAN BELAJAR
  // ---------------------------------------------------------------
  await prisma.student.deleteMany();
  await prisma.classRoom.deleteMany();
  await prisma.classRoom.create({
    data: { nama: "1A", tingkat: 1, tahunAjaran: "2026/2027", waliKelasId: waliKelas1A.id },
  });
  await prisma.classRoom.create({
    data: { nama: "2A", tingkat: 2, tahunAjaran: "2026/2027", waliKelasId: waliKelas2A.id },
  });
  console.log("✅ ClassRoom: 2 rombel (1A, 2A)");

  // ---------------------------------------------------------------
  // 5. FASILITAS
  // ---------------------------------------------------------------
  await prisma.facility.deleteMany();
  await prisma.facility.createMany({
    data: [
      {
        nama: "Perpustakaan",
        deskripsi:
          "Ruang baca nyaman dengan koleksi buku cerita, pelajaran, dan referensi untuk menumbuhkan minat baca siswa.",
        gambarUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
        icon: "BookOpen",
        urutan: 1,
        isPublished: true,
      },
      {
        nama: "UKS",
        deskripsi:
          "Unit Kesehatan Sekolah dengan fasilitas P3K lengkap untuk penanganan pertama siswa yang sakit di sekolah.",
        gambarUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
        icon: "HeartPulse",
        urutan: 2,
        isPublished: true,
      },
    ],
  });
  console.log("✅ Facility: 2 data (Perpustakaan, UKS)");

  // ---------------------------------------------------------------
  // 6. EKSTRAKURIKULER
  // ---------------------------------------------------------------
  await prisma.extracurricular.deleteMany();
  await prisma.extracurricular.create({
    data: {
      nama: "Pramuka",
      deskripsi: "Membentuk karakter disiplin, kemandirian, dan jiwa kepemimpinan siswa.",
      jadwal: "Jumat, 13.00 - 15.00 WIB",
      pembinaId: guruPjok.id,
    },
  });
  console.log("✅ Extracurricular: 1 data (Pramuka)");

  // ---------------------------------------------------------------
  // 7. PRESTASI
  // ---------------------------------------------------------------
  await prisma.achievement.deleteMany();
  await prisma.achievement.create({
    data: {
      judul: "Juara 1 Lomba Cerdas Cermat Tingkat Kecamatan",
      tingkat: "KECAMATAN",
      tahun: 2025,
      atasNamaSiswa: "Tim CCA SDN Panderejo Gempol",
    },
  });
  console.log("✅ Achievement: 1 data");

  // ---------------------------------------------------------------
  // 8. BERITA & PENGUMUMAN
  // ---------------------------------------------------------------
  await prisma.news.deleteMany();
  await prisma.news.create({
    data: {
      title: "Kegiatan Jumat Bersih Tumbuhkan Kepedulian Lingkungan",
      slug: "kegiatan-jumat-bersih",
      excerpt: "Siswa-siswi antusias mengikuti kegiatan kerja bakti membersihkan lingkungan sekolah.",
      content:
        "Setiap hari Jumat pagi, seluruh warga sekolah melaksanakan kegiatan Jumat Bersih sebagai bagian dari Program Lingkungan Sehat Berbudaya Bersih.\n\nKegiatan ini melibatkan seluruh siswa, didampingi guru dan tenaga kependidikan.",
      coverImageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.announcement.deleteMany();
  await prisma.announcement.create({
    data: {
      title: "Pendaftaran PPDB 2026/2027 Telah Dibuka",
      content:
        "Pendaftaran Peserta Didik Baru Tahun Ajaran 2026/2027 sudah dibuka melalui jalur Zonasi, Afirmasi, dan Perpindahan Orang Tua. Silakan daftar melalui menu PPDB.",
      isPenting: true,
    },
  });
  console.log("✅ News & Announcement: masing-masing 1 data");

  // ---------------------------------------------------------------
  // 9. GALERI
  // ---------------------------------------------------------------
  await prisma.galleryPhoto.deleteMany();
  await prisma.galleryAlbum.deleteMany();
  const album = await prisma.galleryAlbum.create({
    data: {
      judul: "Kegiatan Belajar di Perpustakaan",
      deskripsi: "Momen siswa membaca dan berkegiatan di perpustakaan sekolah.",
      coverUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
    },
  });
  await prisma.galleryPhoto.createMany({
    data: [
      { albumId: album.id, url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1000&q=80", urutan: 0 },
      { albumId: album.id, url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1000&q=80", urutan: 1 },
    ],
  });
  console.log("✅ GalleryAlbum: 1 album + 2 foto");

  // ---------------------------------------------------------------
  // 10. PPDB WAVE
  // ---------------------------------------------------------------
  await prisma.ppdbApplicant.deleteMany();
  await prisma.ppdbWave.deleteMany();
  const now = new Date();
  const tutup = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 45);

  await prisma.ppdbWave.create({
    data: {
      tahunAjaran: "2026/2027",
      jalur: "ZONASI",
      kuota: 32,
      kuotaTerisi: 0,
      syaratText: [
        "Kartu Keluarga (KK) yang menunjukkan domisili di sekitar sekolah",
        "Akta Kelahiran",
        "KTP Orang Tua/Wali",
        "Berusia minimal 6 tahun pada 1 Juli 2026",
      ].join("\n"),
      tanggalBuka: now,
      tanggalTutup: tutup,
      isActive: true,
    },
  });
  await prisma.ppdbWave.create({
    data: {
      tahunAjaran: "2026/2027",
      jalur: "AFIRMASI",
      kuota: 8,
      kuotaTerisi: 0,
      syaratText: [
        "Kartu Indonesia Pintar (KIP) atau Kartu Keluarga Sejahtera (KKS)",
        "Kartu Keluarga (KK)",
        "Akta Kelahiran",
        "KTP Orang Tua/Wali",
      ].join("\n"),
      tanggalBuka: now,
      tanggalTutup: tutup,
      isActive: true,
    },
  });
  await prisma.ppdbWave.create({
    data: {
      tahunAjaran: "2026/2027",
      jalur: "PERPINDAHAN",
      kuota: 4,
      kuotaTerisi: 0,
      syaratText: [
        "Surat keterangan pindah tugas orang tua",
        "Kartu Keluarga (KK)",
        "Akta Kelahiran",
        "KTP Orang Tua/Wali",
      ].join("\n"),
      tanggalBuka: now,
      tanggalTutup: tutup,
      isActive: true,
    },
  });
  console.log("✅ PpdbWave: 3 gelombang aktif (Zonasi, Afirmasi, Perpindahan) 2026/2027");

  // ---------------------------------------------------------------
  // 11. FAQ
  // ---------------------------------------------------------------
  await prisma.faq.deleteMany();
  await prisma.faq.createMany({
    data: [
      {
        pertanyaan: "Bagaimana cara mendaftar PPDB secara online?",
        jawaban:
          "Bapak/Ibu dapat mendaftar melalui menu PPDB > Daftar Online. Isi formulir hingga selesai dan simpan nomor pendaftaran yang muncul.",
        urutan: 1,
      },
      {
        pertanyaan: "Berapa usia minimal untuk mendaftar SD?",
        jawaban: "Calon siswa wajib berusia minimal 6 tahun pada tanggal 1 Juli tahun ajaran berjalan.",
        urutan: 2,
      },
    ],
  });
  console.log("✅ Faq: 2 data");

  // ---------------------------------------------------------------
  // 12. TESTIMONIAL
  // ---------------------------------------------------------------
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.create({
    data: {
      nama: "Ibu Sri Wahyuni",
      peran: "Wali Murid Kelas 3A",
      pesan: "Guru-guru sangat sabar dan komunikatif. Anak saya jadi lebih semangat berangkat sekolah.",
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
  });
  console.log("✅ Testimonial: 1 data (approved & featured)");

  console.log("\n🎉 Seeding selesai!\n");
  console.log("Login Dashboard Admin dengan:");
  console.log("  Email    : admin@sdnpanderejogempol.sch.id");
  console.log(`  Password : ${defaultPassword}`);
  console.log("  ⚠️  GANTI PASSWORD INI SEGERA setelah login pertama kali!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
