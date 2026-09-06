-- AlterTable
ALTER TABLE "EmailVerificationCode" ADD COLUMN "resendCount" INTEGER NOT NULL DEFAULT 0;
