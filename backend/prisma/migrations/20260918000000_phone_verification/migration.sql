-- AlterTable
ALTER TABLE "User" ALTER COLUMN "cellphone" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "cellphoneVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PhoneVerificationCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneVerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhoneVerificationCode_userId_idx" ON "PhoneVerificationCode"("userId");

-- AddForeignKey
ALTER TABLE "PhoneVerificationCode" ADD CONSTRAINT "PhoneVerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
