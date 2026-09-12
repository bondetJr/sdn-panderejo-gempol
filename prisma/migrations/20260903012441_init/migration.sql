-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'KEPALA_SEKOLAH', 'OPERATOR', 'GURU');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PpdbStatus" AS ENUM ('MENUNGGU_VERIFIKASI', 'DIVERIFIKASI', 'DITERIMA', 'CADANGAN', 'DITOLAK');

-- CreateEnum
CREATE TYPE "JalurPpdb" AS ENUM ('ZONASI', 'AFIRMASI', 'PERPINDAHAN');

-- CreateEnum
CREATE TYPE "DokumenJenis" AS ENUM ('KARTU_KELUARGA', 'AKTA_KELAHIRAN', 'KTP_ORTU', 'KIP', 'IJAZAH_TK', 'FOTO_ANAK', 'LAINNYA');

-- CreateEnum
CREATE TYPE "PrestasiTingkat" AS ENUM ('SEKOLAH', 'KECAMATAN', 'KABUPATEN', 'PROVINSI', 'NASIONAL');

-- CreateEnum
CREATE TYPE "StatusKepegawaian" AS ENUM ('PNS', 'PPPK', 'HONORER');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL DEFAULT 'SD Negeri Panderejo Gempol',
    "npsn" TEXT NOT NULL DEFAULT '20519616',
    "tagline" TEXT DEFAULT 'Belajar Seru, Karakter Kuat, Berakhlak Mulia',
    "alamat" TEXT,
    "desa" TEXT DEFAULT 'Panderejo',
    "kecamatan" TEXT DEFAULT 'Gempol',
    "kabupaten" TEXT DEFAULT 'Pasuruan',
    "provinsi" TEXT DEFAULT 'Jawa Timur',
    "kodePos" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "mapsEmbedUrl" TEXT,
    "visi" TEXT,
    "misi" TEXT,
    "sejarah" TEXT,
    "strukturOrgUrl" TEXT,
    "akreditasi" TEXT,
    "akreditasiTahun" INTEGER,
    "kurikulumText" TEXT,
    "tahunAjaranAktif" TEXT DEFAULT '2026/2027',
    "jamLayanan" TEXT DEFAULT 'Senin - Jumat, 07.30 - 13.00 WIB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT,
    "nuptk" TEXT,
    "jabatan" TEXT NOT NULL,
    "statusKepegawaian" "StatusKepegawaian" NOT NULL,
    "isKepalaSekolah" BOOLEAN NOT NULL DEFAULT false,
    "fotoUrl" TEXT,
    "sambutanText" TEXT,
    "mapelDiampu" TEXT,
    "tanggalMasuk" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassRoom" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tingkat" INTEGER NOT NULL,
    "tahunAjaran" TEXT NOT NULL DEFAULT '2026/2027',
    "waliKelasId" TEXT,
    "jumlahSiswa" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nis" TEXT,
    "nisn" TEXT,
    "nik" TEXT,
    "jenisKelamin" "JenisKelamin",
    "classRoomId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "kategori" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extracurricular" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "jadwal" TEXT,
    "fotoUrl" TEXT,
    "pembinaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Extracurricular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "gambarUrl" TEXT NOT NULL,
    "icon" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlagshipProgram" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsiSingkat" TEXT NOT NULL,
    "deskripsiLengkap" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "icon" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlagshipProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgCommitteeMember" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgCommitteeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tingkat" "PrestasiTingkat" NOT NULL,
    "tahun" INTEGER NOT NULL,
    "deskripsi" TEXT,
    "fotoUrl" TEXT,
    "atasNamaSiswa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPenting" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryAlbum" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PpdbWave" (
    "id" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "jalur" "JalurPpdb" NOT NULL,
    "kuota" INTEGER NOT NULL,
    "kuotaTerisi" INTEGER NOT NULL DEFAULT 0,
    "syaratText" TEXT NOT NULL,
    "tanggalBuka" TIMESTAMP(3) NOT NULL,
    "tanggalTutup" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PpdbWave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PpdbApplicant" (
    "id" TEXT NOT NULL,
    "noPendaftaran" TEXT NOT NULL,
    "waveId" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nisn" TEXT,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" "JenisKelamin",
    "namaAyah" TEXT,
    "namaIbu" TEXT,
    "noHpOrtu" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "jarakKeSekolahKm" DOUBLE PRECISION,
    "status" "PpdbStatus" NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
    "catatanVerifikasi" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PpdbApplicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PpdbDocument" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "jenis" "DokumenJenis" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PpdbDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT,
    "telepon" TEXT,
    "subjek" TEXT,
    "pesan" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isPengaduan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "peran" TEXT,
    "pesan" TEXT NOT NULL,
    "rating" INTEGER,
    "fotoUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "jawaban" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleSlot" (
    "id" TEXT NOT NULL,
    "tingkat" INTEGER NOT NULL,
    "hari" TEXT NOT NULL,
    "hariIndex" INTEGER NOT NULL,
    "jamKe" INTEGER NOT NULL,
    "waktu" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "School_npsn_key" ON "School"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_teacherId_key" ON "User"("teacherId");

-- CreateIndex
CREATE INDEX "AdminActionLog_userId_idx" ON "AdminActionLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_nip_key" ON "Teacher"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_nuptk_key" ON "Teacher"("nuptk");

-- CreateIndex
CREATE INDEX "Teacher_jabatan_idx" ON "Teacher"("jabatan");

-- CreateIndex
CREATE UNIQUE INDEX "ClassRoom_nama_tahunAjaran_key" ON "ClassRoom"("nama", "tahunAjaran");

-- CreateIndex
CREATE UNIQUE INDEX "Student_nisn_key" ON "Student"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "Student_nik_key" ON "Student"("nik");

-- CreateIndex
CREATE INDEX "Student_classRoomId_idx" ON "Student"("classRoomId");

-- CreateIndex
CREATE INDEX "Facility_urutan_idx" ON "Facility"("urutan");

-- CreateIndex
CREATE INDEX "FlagshipProgram_urutan_idx" ON "FlagshipProgram"("urutan");

-- CreateIndex
CREATE INDEX "OrgCommitteeMember_urutan_idx" ON "OrgCommitteeMember"("urutan");

-- CreateIndex
CREATE INDEX "Achievement_tingkat_tahun_idx" ON "Achievement"("tingkat", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_slug_idx" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_status_publishedAt_idx" ON "News"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Announcement_isPenting_publishedAt_idx" ON "Announcement"("isPenting", "publishedAt");

-- CreateIndex
CREATE INDEX "GalleryPhoto_albumId_idx" ON "GalleryPhoto"("albumId");

-- CreateIndex
CREATE INDEX "PpdbWave_tahunAjaran_jalur_idx" ON "PpdbWave"("tahunAjaran", "jalur");

-- CreateIndex
CREATE UNIQUE INDEX "PpdbApplicant_noPendaftaran_key" ON "PpdbApplicant"("noPendaftaran");

-- CreateIndex
CREATE INDEX "PpdbApplicant_noPendaftaran_idx" ON "PpdbApplicant"("noPendaftaran");

-- CreateIndex
CREATE INDEX "PpdbApplicant_nik_idx" ON "PpdbApplicant"("nik");

-- CreateIndex
CREATE INDEX "PpdbApplicant_status_idx" ON "PpdbApplicant"("status");

-- CreateIndex
CREATE INDEX "PpdbDocument_applicantId_idx" ON "PpdbDocument"("applicantId");

-- CreateIndex
CREATE INDEX "ContactMessage_isRead_idx" ON "ContactMessage"("isRead");

-- CreateIndex
CREATE INDEX "Testimonial_isFeatured_isApproved_idx" ON "Testimonial"("isFeatured", "isApproved");

-- CreateIndex
CREATE INDEX "ScheduleSlot_tingkat_idx" ON "ScheduleSlot"("tingkat");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_tingkat_hariIndex_jamKe_key" ON "ScheduleSlot"("tingkat", "hariIndex", "jamKe");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRoom" ADD CONSTRAINT "ClassRoom_waliKelasId_fkey" FOREIGN KEY ("waliKelasId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classRoomId_fkey" FOREIGN KEY ("classRoomId") REFERENCES "ClassRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extracurricular" ADD CONSTRAINT "Extracurricular_pembinaId_fkey" FOREIGN KEY ("pembinaId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PpdbApplicant" ADD CONSTRAINT "PpdbApplicant_waveId_fkey" FOREIGN KEY ("waveId") REFERENCES "PpdbWave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PpdbDocument" ADD CONSTRAINT "PpdbDocument_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "PpdbApplicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
