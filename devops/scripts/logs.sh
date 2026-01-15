#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

COMPOSE_DIR="${REPO_ROOT}/devops/compose"
ENV_FILE="${REPO_ROOT}/devops/.env"

BASE_COMPOSE="${COMPOSE_DIR}/compose.yml"
PROD_COMPOSE="${COMPOSE_DIR}/compose.prod.yml"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "❌ Env file not found: ${ENV_FILE}"
  exit 1
fi
if [[ ! -f "${BASE_COMPOSE}" ]]; then
  echo "❌ Compose file not found: ${BASE_COMPOSE}"
  exit 1
fi

COMPOSE_FILES=(-f "${BASE_COMPOSE}")
if [[ -f "${PROD_COMPOSE}" ]]; then
  COMPOSE_FILES+=(-f "${PROD_COMPOSE}")
fi

DC=(docker compose --env-file "${ENV_FILE}" "${COMPOSE_FILES[@]}")

TAIL="${LOGS_TAIL:-200}"

# Usage:
#   ./logs.sh                 -> all services
#   ./logs.sh backend         -> only backend
#   ./logs.sh agents          -> only agents
#   ./logs.sh backend --since=10m
if [[ $# -ge 1 ]]; then
  SERVICE="$1"
  shif
