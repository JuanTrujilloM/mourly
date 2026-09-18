-- DropIndex
DROP INDEX "WaitlistEntry_domain_idx";

-- CreateIndex
CREATE INDEX "WaitlistEntry_createdAt_id_idx" ON "WaitlistEntry"("createdAt", "id");
