-- Data: numbers stored before E.164 was enforced become +57…, skipping any that would collide
UPDATE "User" AS legacy
SET "cellphone" = '+57' || legacy."cellphone"
WHERE legacy."cellphone" ~ '^3[0-9]{9}$'
  AND NOT EXISTS (
    SELECT 1 FROM "User" AS other WHERE other."cellphone" = '+57' || legacy."cellphone"
  );

UPDATE "User" AS legacy
SET "cellphone" = '+' || legacy."cellphone"
WHERE legacy."cellphone" ~ '^573[0-9]{9}$'
  AND NOT EXISTS (
    SELECT 1 FROM "User" AS other WHERE other."cellphone" = '+' || legacy."cellphone"
  );
