#!/bin/bash
# Strict mode : on arrête tout si une commande échoue
set -e

PROJECT_DIR="/opt/multi-agent-app"
cd $PROJECT_DIR

echo "--- 1. Authentification à la Registry ---"
# Utilisation du jeton passé par GitHub Actions pour récupérer les images buildées
echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

echo "--- 2. Récupération des dernières images (O(1) transfer) ---"
# On télécharge les images pré-construites (backend, agents, etc.)
docker compose pull

echo "--- 3. Mise à jour des conteneurs ---"
# --remove-orphans : supprime les anciens agents si vous avez renommé un service
# -d : mode détaché (arrière-plan)
docker compose up -d --remove-orphans

echo "--- 4. Nettoyage de sécurité ---"
# Supprime les images "dangling" (les anciennes versions qui prennent de la place)
docker image prune -f

echo "--- Statut du déploiement ---"
docker compose ps