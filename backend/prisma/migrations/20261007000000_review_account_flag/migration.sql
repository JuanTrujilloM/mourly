-- Platform-reviewer accounts are marked in the row, so they stay out of matching after the review env vars are removed
ALTER TABLE "User" ADD COLUMN "isReviewAccount" BOOLEAN NOT NULL DEFAULT false;
