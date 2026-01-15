#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

COMPOSE_DIR="${REPO_ROOT}/devops/compose"
ENV_FILE="${REPO_ROOT}/devops/.env"

BASE_COMPOSE="${COMPOSE_DIR}/compose.yml"
PROD_COMPOSE="${COMPOSE_DIR}/compose.prod.yml"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing command: $1"; exit 1; }
}

need_cmd docker
if ! docker compose version >/dev/null 2>&1; then
  echo "❌ 'docker compose' not available (Compose v2 required)."
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "❌ Env file not found: ${ENV_FILE}"
  exit 1
fi
if [[ ! -f "${BASE_COMPOSE}" ]]; then
  echo "❌ Compose file not found: ${BASE_COMPOSE}"
  exit 1
fi

# Use prod override if it exists
COMPOSE_FILES=(-f "${BASE_COMPOSE}")
if [[ -f "${PROD_COMPOSE}" ]]; then
  COMPOSE_FILES+=(-f "${PROD_COMPOSE}")
fi

DC=(docker compose --env-file "${ENV_FILE}" "${COMPOSE_FILES[@]}")

# Default scale from .env
AGENTS_REPLICAS="${AGENTS_REPLICAS:-1}"

# Optional args
# ./deploy.sh 10 -> scale agents to 10
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
  AGENTS_REPLICAS="$1"
fi

echo "📌 Repo: ${REPO_ROOT}"
echo "📌 Env:  ${ENV_FILE}"
echo "📌 Scale agents: ${AGENTS_REPLICAS}"
echo "🚀 Deploy starting..."

echo "⬇️  Pulling external images..."
"${DC[@]}" pull

echo "🏗️  Building images..."
"${DC[@]}" build --pull

echo "🟢 Starting stack (no nginx, ports exposed)..."
"${DC[@]}" up -d --remove-orphans --scale agents="${AGENTS_REPLICAS}"

echo "✅ Deploy done."
echo "📊 Status:"
"${SCRIPT_DIR}/status.sh"
