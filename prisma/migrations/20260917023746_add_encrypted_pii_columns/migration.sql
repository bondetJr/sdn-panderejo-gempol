/*
  Warnings:

  - A unique constraint covering the columns `[nikHash]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PpdbApplicant" ADD COLUMN     "nikEncrypted" TEXT,
ADD COLUMN     "nikHash" TEXT,
ADD COLUMN     "noHpOrtuEncrypted" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "nikEncrypted" TEXT,
ADD COLUMN     "nikHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_nikHash_key" ON "Student"("nikHash");
