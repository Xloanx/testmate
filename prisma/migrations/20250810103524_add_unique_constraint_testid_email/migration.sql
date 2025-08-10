/*
  Warnings:

  - A unique constraint covering the columns `[testId,email]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Participant_email_idx" ON "public"."Participant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_testId_email_key" ON "public"."Participant"("testId", "email");
