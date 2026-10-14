/*
  Warnings:

  - You are about to drop the column `nik` on the `PpdbApplicant` table. All the data in the column will be lost.
  - You are about to drop the column `noHpOrtu` on the `PpdbApplicant` table. All the data in the column will be lost.
  - You are about to drop the column `nik` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nikHash,waveId]` on the table `PpdbApplicant` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nikEncrypted` on table `PpdbApplicant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nikHash` on table `PpdbApplicant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `noHpOrtuEncrypted` on table `PpdbApplicant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "PpdbApplicant_nik_idx";

-- DropIndex
DROP INDEX "Student_nik_key";

-- AlterTable
ALTER TABLE "PpdbApplicant" DROP COLUMN "nik",
DROP COLUMN "noHpOrtu",
ALTER COLUMN "nikEncrypted" SET NOT NULL,
ALTER COLUMN "nikHash" SET NOT NULL,
ALTER COLUMN "noHpOrtuEncrypted" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "nik";

-- CreateIndex
CREATE UNIQUE INDEX "PpdbApplicant_nikHash_waveId_key" ON "PpdbApplicant"("nikHash", "waveId");
