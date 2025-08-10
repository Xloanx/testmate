/*
  Warnings:

  - The `authMode` column on the `Test` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `showResults` column on the `Test` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."TestShowResults" AS ENUM ('immediate', 'adminOnly', 'both');

-- CreateEnum
CREATE TYPE "public"."TestAuthMode" AS ENUM ('freeForAll', 'registrationRequired', 'exclusiveParticipants');

-- AlterTable
ALTER TABLE "public"."Test" DROP COLUMN "authMode",
ADD COLUMN     "authMode" "public"."TestAuthMode" NOT NULL DEFAULT 'freeForAll',
DROP COLUMN "showResults",
ADD COLUMN     "showResults" "public"."TestShowResults" NOT NULL DEFAULT 'immediate';
