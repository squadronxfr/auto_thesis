#!/usr/bin/env bash
set -euo pipefail

# Trouver la racine du repo (2 niveaux au-dessus de devops/scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

ENV_FILE="${REPO_ROOT}/devops/.env.example"
BASE_COMPOSE="${REPO_ROOT}/devops/compose/compose.yml"
PROD_COMPOSE="${REPO_ROOT}/devops/compose/compose.prod.yml"

## Scale agents (optionnel)
#AGENTS_REPLICAS="${AGENTS_REPLICAS:-1}"
#if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
#  AGENTS_REPLICAS="$1"
#fi

# Compose command
DC=(docker compose --env-file "${ENV_FILE}" -f "${BASE_COMPOSE}")

# Ajoute compose.prod.yml si présent
if [[ -f "${PROD_COMPOSE}" ]]; then
  DC+=(-f "${PROD_COMPOSE}")
fi

echo "📌 Repo: ${REPO_ROOT}"
echo "📌 Env:  ${ENV_FILE}"
echo "📌 Compose: ${BASE_COMPOSE}"
[[ -f "${PROD_COMPOSE}" ]] && echo "📌 Prod override: ${PROD_COMPOSE}"
## echo "📌 Agents replicas: ${AGENTS_REPLICAS}"

# Déploiement avec arrêt propre pour mise à jour
echo "🔄 Arrêt des conteneurs existants..."
"${DC[@]}" down

echo "📦 Pull des images..."
"${DC[@]}" pull

echo "🔨 Build des images..."
"${DC[@]}" build --pull

echo "🚀 Démarrage des services..."
"${DC[@]}" up -d --remove-orphans

echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

echo "✅ Deploy OK"
"${REPO_ROOT}/devops/scripts/status.sh"
