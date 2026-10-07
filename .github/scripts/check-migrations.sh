#!/usr/bin/env bash
# The API keeps running on the old image while `prisma migrate deploy` runs, and a
# rollback reuses the migrated schema, so every migration must be backward compatible:
# expand first (add the new column, dual-write), contract in a later release.
set -euo pipefail

BASE_REF="${1:?usage: check-migrations.sh <base-ref>}"
MIGRATIONS='backend/prisma/migrations'
BREAKING='RENAME[[:space:]]+(COLUMN|TO)|DROP[[:space:]]+(COLUMN|TABLE)|ALTER[[:space:]]+COLUMN[^;]*[[:space:]]TYPE[[:space:]]'
CONTRACT_MARKER='-- contract-step:'
status=0

edited="$(git diff --name-only --diff-filter=MDR "$BASE_REF"...HEAD -- "$MIGRATIONS" | grep -v 'migration_lock.toml' || true)"
if [ -n "$edited" ]; then
  echo "::error::Applied migrations are immutable (Prisma checksums them). Add a new migration instead:"
  echo "$edited"
  status=1
fi

added="$(git diff --name-only --diff-filter=A "$BASE_REF"...HEAD -- "$MIGRATIONS/*/migration.sql")"
for file in $added; do
  if grep -qiE "$BREAKING" "$file" && ! grep -qF -- "$CONTRACT_MARKER" "$file"; then
    echo "::error file=$file::Breaking statement in a migration. Split it into expand/contract, or add '$CONTRACT_MARKER <why the running release no longer uses it>'."
    grep -niE "$BREAKING" "$file"
    status=1
  fi
done

[ "$status" -eq 0 ] && echo "Migrations are backward compatible."
exit "$status"
