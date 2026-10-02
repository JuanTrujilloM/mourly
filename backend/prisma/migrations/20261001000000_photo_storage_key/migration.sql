-- Photos store the object key; the API signs a short-lived URL per response
ALTER TABLE "Photo" RENAME COLUMN "url" TO "key";

UPDATE "Photo"
SET "key" = substring("key" from '^https://storage\.googleapis\.com/[^/]+/(.+)$')
WHERE "key" ~ '^https://storage\.googleapis\.com/[^/]+/.+';

-- Data: local dev uploads served by the API under /uploads/
UPDATE "Photo"
SET "key" = substring("key" from '/uploads/(.+)$')
WHERE "key" ~ '^https?://[^/]+/uploads/.+';
