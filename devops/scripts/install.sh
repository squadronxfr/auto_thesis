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

# Env file (prefer devops/.env if present; fallback to devops/.env.example)
ENV_FILE="${ENV_FILE:-devops/.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  ENV_FILE="devops/.env.example"
fi

# Load env vars from file (only simple KEY=VALUE lines)
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# Arret des conteneurs existants pour une mise a jour propre
echo ">> Arret des conteneurs existants..."
docker compose --env-file "$ENV_FILE" -f devops/compose/compose.prod.yml down

# Pull des nouvelles images
echo ">> Telechargement des nouvelles images..."
docker compose --env-file "$ENV_FILE" -f devops/compose/compose.prod.yml pull

# Demarrage des services
echo ">> Demarrage des services..."
docker compose --env-file "$ENV_FILE" -f devops/compose/compose.prod.yml up -d --remove-orphans

# Init DB (optional). Set RUN_DB_INIT=1 in the env file to enable.
if [[ "${RUN_DB_INIT:-0}" == "1" ]]; then
  POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-auto_thesis_postgres}"
  SQL_PATH="${SQL_PATH:-$APP_DIR/DB/init-db/pg_script.sql}"

  echo ">> Init DB: waiting for postgres..."
  for i in {1..30}; do
    if docker exec "$POSTGRES_CONTAINER" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done

  if [[ -f "$SQL_PATH" ]]; then
    echo ">> Init DB: applying $SQL_PATH"
    docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$SQL_PATH"
  else
    echo ">> Init DB: SQL file not found at $SQL_PATH"
  fi
fi

echo "OK. Install/Deploy termine"
docker compose --env-file "$ENV_FILE" -f devops/compose/compose.prod.yml ps
