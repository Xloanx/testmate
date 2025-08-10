/*
  Warnings:

  - Added the required column `orderIndex` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "orderIndex" INTEGER NOT NULL;
