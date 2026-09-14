ALTER TABLE "FlagshipProgram"
  ADD COLUMN "realisasiText" TEXT,
  ADD COLUMN "impactUtama" TEXT,
  ADD COLUMN "impactSatu" TEXT,
  ADD COLUMN "impactDua" TEXT,
  ADD COLUMN "impactTiga" TEXT;

CREATE TABLE "FlagshipProgramImage" (
  "id" TEXT NOT NULL,
  "programId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "urutan" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FlagshipProgramImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FlagshipProgramImage_programId_urutan_idx"
  ON "FlagshipProgramImage"("programId", "urutan");

ALTER TABLE "FlagshipProgramImage"
  ADD CONSTRAINT "FlagshipProgramImage_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "FlagshipProgram"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
