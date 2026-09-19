CREATE TABLE "ServiceStandard" (
  "id" TEXT NOT NULL,
  "nama" TEXT NOT NULL,
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

  CONSTRAINT "ServiceStandard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ServiceStandard_isPublished_urutan_idx"
  ON "ServiceStandard"("isPublished", "urutan");
