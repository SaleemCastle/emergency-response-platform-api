/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `Emergency` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Emergency" DROP COLUMN "photoUrl",
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "severity" INTEGER NOT NULL DEFAULT 1;
