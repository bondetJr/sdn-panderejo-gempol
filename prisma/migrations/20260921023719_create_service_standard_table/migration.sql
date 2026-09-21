/*
  Warnings:

  - You are about to drop the `ServiceStandard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ServiceStandard";

-- CreateTable
CREATE TABLE "service_standard" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "judul" TEXT,
    "coverImage" TEXT,
    "deskripsi" TEXT NOT NULL,
    "persyaratan" TEXT NOT NULL,
    "mekanismeImage" TEXT,
    "mekanismeText" TEXT,
    "waktuPelayanan" TEXT,
    "biaya" TEXT,
    "produkLayanan" TEXT,
    "pengaduan" TEXT,
    "documentFile" TEXT,
    "documentName" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_standard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_standard_isPublished_urutan_idx" ON "service_standard"("isPublished", "urutan");
