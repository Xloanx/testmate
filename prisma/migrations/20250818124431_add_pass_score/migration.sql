/*
  Warnings:

  - Added the required column `passScore` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Test" ADD COLUMN     "passScore" INTEGER NOT NULL DEFAULT 50;
