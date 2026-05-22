/*
  Warnings:

  - Added the required column `totalOccupants` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "occupantsEvacuated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalOccupants" INTEGER NOT NULL;
