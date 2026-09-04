-- AlterTable
ALTER TABLE "Date" ADD COLUMN "feedbackRequestedAt" TIMESTAMP(3),
                   ADD COLUMN "feedbackReminderAt"  TIMESTAMP(3),
                   ADD COLUMN "feedbackClosedAt"    TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Date_feedbackClosedAt_scheduledAt_idx" ON "Date"("feedbackClosedAt", "scheduledAt");
