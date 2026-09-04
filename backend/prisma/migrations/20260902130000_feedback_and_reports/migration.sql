-- Drop duplicate feedback rows before enforcing one entry per user per date.
DELETE FROM "Feedback" a
USING "Feedback" b
WHERE a."dateId" = b."dateId"
  AND a."userId" = b."userId"
  AND a."createdAt" > b."createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_dateId_userId_key" ON "Feedback"("dateId", "userId");

-- AlterTable
ALTER TABLE "Report" ADD COLUMN "reason" TEXT;

-- Drop duplicate reports before enforcing one report per reporter per reported user.
DELETE FROM "Report" a
USING "Report" b
WHERE a."userAId" = b."userAId"
  AND a."userBId" = b."userBId"
  AND a."createdAt" > b."createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "Report_userAId_userBId_key" ON "Report"("userAId", "userBId");
