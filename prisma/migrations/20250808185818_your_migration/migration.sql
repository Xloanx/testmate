/*
  Warnings:

  - You are about to drop the column `isActive` on the `Test` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TestStatus" AS ENUM ('draft', 'published', 'archived');

-- AlterTable
ALTER TABLE "public"."Test" DROP COLUMN "isActive",
ADD COLUMN     "status" "public"."TestStatus" NOT NULL DEFAULT 'draft';
