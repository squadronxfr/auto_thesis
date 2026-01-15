#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/apps/auto_thesis}"
REPO_URL="${REPO_URL:-https://github.com/squadronxfr/auto_thesis.git}"
BRANCH="${BRANCH:-scrum-23/deploiement_template_docker}"

mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [[ ! -d .git ]]; then
  git clone -b "$BRANCH" "$REPO_URL" .
else
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --rebase origin "$BRANCH"
fi

# Login GHCR (utilise un PAT, pas le token "GITHUB_TOKEN" de GitHub Actions)
: "${GHCR_USERNAME:?Set GHCR_USERNAME}"
: "${GHCR_TOKEN:?Set GHCR_TOKEN}"

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

docker compose --env-file devops/.env -f devops/compose/compose.prod.yml pull
docker compose --env-file devops/.env -f devops/compose/compose.prod.yml up -d --remove-orphans

echo "✅ Install/Deploy terminé"
docker compose --env-file devops/.env -f devops/compose/compose.prod.yml ps