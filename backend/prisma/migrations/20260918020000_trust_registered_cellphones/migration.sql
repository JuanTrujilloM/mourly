-- Data: numbers given at sign-up, before SMS verification existed, count as verified
UPDATE "User"
SET "cellphoneVerifiedAt" = now()
WHERE "cellphone" IS NOT NULL
  AND "cellphoneVerifiedAt" IS NULL;
