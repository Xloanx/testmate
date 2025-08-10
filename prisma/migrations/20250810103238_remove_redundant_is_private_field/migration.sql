/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `Test` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ParticipantInvitationStatus" AS ENUM ('pending', 'accepted', 'declined', 'revoked');

-- AlterTable
ALTER TABLE "public"."Test" DROP COLUMN "isPrivate";
