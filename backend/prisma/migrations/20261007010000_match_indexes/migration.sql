-- Matching, the crons and the admin views filter Match by either user and by status
CREATE INDEX "Match_userAId_idx" ON "Match"("userAId");

CREATE INDEX "Match_userBId_idx" ON "Match"("userBId");

CREATE INDEX "Match_status_idx" ON "Match"("status");
