#!/usr/bin/env bash
# Runs on the VM as root, invoked by .github/workflows/deploy-backend.yml.
# Usage: deploy.sh <api-image> <migrate-image> <directory-with-uploaded-files>
set -euo pipefail

API_IMAGE="$1"
MIGRATE_IMAGE="$2"
UPLOAD_DIR="$3"
APP_DIR=/opt/mourly
REGISTRY=us-east1-docker.pkg.dev

install -m 644 "$UPLOAD_DIR/docker-compose.yml" "$UPLOAD_DIR/Caddyfile" "$APP_DIR/"
printf 'API_IMAGE=%s\nMIGRATE_IMAGE=%s\n' "$API_IMAGE" "$MIGRATE_IMAGE" > "$APP_DIR/release.next.env"

# Root pulls the images, so root's Docker config needs the registry credential helper.
gcloud auth configure-docker "$REGISTRY" --quiet

compose() {
  docker compose \
    --project-name mourly \
    --file "$APP_DIR/docker-compose.yml" \
    --env-file "$APP_DIR/.env" \
    --env-file "$APP_DIR/release.next.env" \
    "$@"
}

compose pull api migrate
# Migrations run before the new API starts; if they fail, the old containers keep serving.
compose run --rm migrate
compose up -d --remove-orphans
compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile

API_CONTAINER="$(compose ps -q api)"
for _ in $(seq 1 30); do
  STATUS="$(docker inspect -f '{{.State.Health.Status}}' "$API_CONTAINER")"
  if [ "$STATUS" = "healthy" ]; then
    # Promoted only after a healthy start, so a manual `compose up` never picks a broken release.
    mv "$APP_DIR/release.next.env" "$APP_DIR/release.env"
    docker image prune -f
    rm -rf "$UPLOAD_DIR"
    echo "Deploy healthy: $API_IMAGE"
    exit 0
  fi
  sleep 5
done

echo "API did not become healthy; last status: $STATUS" >&2
compose logs --tail 50 api >&2
exit 1
