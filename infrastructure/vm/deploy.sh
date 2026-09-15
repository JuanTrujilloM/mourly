#!/usr/bin/env bash
# Runs on the VM as root, invoked by .github/workflows/deploy-backend.yml.
# Usage: deploy.sh <api-image> <migrate-image> <directory-with-uploaded-files>
set -Eeuo pipefail

API_IMAGE="$1"
MIGRATE_IMAGE="$2"
UPLOAD_DIR="$3"
APP_DIR="${APP_DIR:-/opt/mourly}"
REGISTRY=us-east1-docker.pkg.dev
IMAGE_REPOSITORY="${API_IMAGE%:*}"
# Two images of roughly 400 MB are pulled per deploy; stop early rather than fill the disk mid-pull.
MIN_FREE_DISK_KB=$((1500 * 1024))

free_disk_kb() {
  df --output=avail -k /var/lib/docker | tail -n 1 | tr -d ' '
}

ensure_free_disk() {
  if [ "$(free_disk_kb)" -lt "$MIN_FREE_DISK_KB" ]; then
    docker image prune -f
  fi
  if [ "$(free_disk_kb)" -lt "$MIN_FREE_DISK_KB" ]; then
    echo "Not enough free disk to pull a release: $(free_disk_kb) KB available" >&2
    exit 1
  fi
}

released_image() {
  sed -n 's/^API_IMAGE=//p' "$APP_DIR/release.env" 2>/dev/null || true
}

# `image prune` only removes dangling images, and every release has its own SHA tag,
# so old releases are removed explicitly. The previous API image stays for rollbacks.
remove_old_images() {
  local keep="$1"
  docker image ls "$IMAGE_REPOSITORY" --format '{{.Repository}}:{{.Tag}}' |
    grep -vxF -e "$API_IMAGE" -e "$MIGRATE_IMAGE" -e "${keep:-none}" |
    xargs -r docker image rm || true
  docker image prune -f
}

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

# Migrations are already applied at this point, so they must stay backward compatible
# (expand first, contract in a later release) for the previous image to run on them.
roll_back() {
  trap - ERR
  local previous
  previous="$(released_image)"
  if [ -z "$previous" ]; then
    echo "No previous release to roll back to" >&2
    return
  fi
  echo "Rolling back to $previous" >&2
  docker compose \
    --project-name mourly \
    --file "$APP_DIR/docker-compose.yml" \
    --env-file "$APP_DIR/.env" \
    --env-file "$APP_DIR/release.env" \
    up -d api
  rm -f "$APP_DIR/release.next.env"
}

ensure_free_disk
compose pull api migrate
# Migrations run before the new API starts; if they fail, the old containers keep serving.
compose run --rm migrate
trap roll_back ERR
compose up -d --remove-orphans
compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile

API_CONTAINER="$(compose ps -q api)"
for _ in $(seq 1 30); do
  STATUS="$(docker inspect -f '{{.State.Health.Status}}' "$API_CONTAINER")"
  if [ "$STATUS" = "healthy" ]; then
    trap - ERR
    PREVIOUS_API_IMAGE="$(released_image)"
    # Promoted only after a healthy start, so a manual `compose up` never picks a broken release.
    mv "$APP_DIR/release.next.env" "$APP_DIR/release.env"
    remove_old_images "$PREVIOUS_API_IMAGE"
    rm -rf "$UPLOAD_DIR"
    echo "Deploy healthy: $API_IMAGE"
    exit 0
  fi
  sleep 5
done

echo "API did not become healthy; last status: $STATUS" >&2
compose logs --tail 50 api >&2
roll_back
exit 1
