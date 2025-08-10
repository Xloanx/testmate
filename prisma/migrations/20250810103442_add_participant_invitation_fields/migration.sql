-- AlterTable
ALTER TABLE "public"."Participant" ADD COLUMN     "invitationSentAt" TIMESTAMP(3),
ADD COLUMN     "invitationStatus" "public"."ParticipantInvitationStatus" NOT NULL DEFAULT 'pending';
