# Guide de deploiement (Prod)

Ce projet utilise Docker Compose avec deux services back-end (API + MCP), plus Postgres, Redis et le Frontend.

## Comment ca fonctionne

- **Frontend** : build Vite compile, servi par nginx dans le conteneur (port interne 80).
- **Backend** : API FastAPI exposee sur `${BACKEND_PORT}`.
- **MCP** : serveur Node qui expose des outils (read_pdf, fetch_url_content, generate_pdf).
- **Postgres/Redis** : stockage et cache.
- **Compose** : orchestre tous les services et leurs reseaux/ports.

## Prerequis

- Docker + Docker Compose
- Un fichier `.env` dans `devops/`

## 1) Creer le fichier d'environnement

```bash
cd /opt/apps/auto_thesis
cp devops/.env.example devops/.env
```

Edite `devops/.env` et renseigne au minimum :
- `GHCR_OWNER`
- `APP_VERSION` (tag pousse par GitHub Actions, ex: `main`)

Si tu ne veux pas mettre les cles dans le fichier, tu peux les passer directement a la commande (voir plus bas).

## 2) Connexion a GHCR (si images privees)

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
```

## Deploiement sans mettre les cles dans le .env

Tu peux passer les cles directement a la commande d'installation :

```bash
curl -fsSL "https://raw.githubusercontent.com/squadronxfr/auto_thesis/scrum-23/deploiement_template_docker/devops/scripts/install.sh" | \
sudo GHCR_USERNAME="..." GHCR_TOKEN="..." SECRET_KEY="..." GEMINI_API_KEY="..." AI_API_KEY="..." BRAVE_API_KEY="..." bash
```

## 3) Pull des images

```bash
docker compose --env-file devops/.env -f devops/compose/compose.prod.yml pull
```

## 4) Demarrer les services

```bash
docker compose --env-file devops/.env -f devops/compose/compose.prod.yml up -d
```

## 5) Verifier l'etat

```bash
docker compose --env-file devops/.env -f devops/compose/compose.prod.yml ps
docker compose --env-file devops/.env -f devops/compose/compose.prod.yml logs -f --tail=200
```

## Frontend seul (test rapide)

```bash
docker compose --env-file devops/.env -f devops/compose/compose.prod.yml up -d --no-deps frontend
```

Le frontend est servi par nginx en prod, donc le conteneur ecoute sur le port 80.
Avec le mapping par defaut dans `compose.prod.yml` :
```
http://<IP_SERVEUR>:40000
```

## Tests MCP

Health :
```bash
curl http://localhost:${MCP_HOST_PORT:-8081}/health
```

Liste des outils :
```bash
curl http://localhost:${MCP_HOST_PORT:-8081}/tools
```

Test fetch URL :
```bash
curl -X POST http://localhost:${MCP_HOST_PORT:-8081}/tools/fetch_url_content \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

## Corrections courantes

- **Frontend reset / refuse** : verifier que le mapping est `40000:80` dans `devops/compose/compose.prod.yml`.
- **Backend unhealthy** : regarder les logs et corriger les imports Python ou les variables manquantes.

## Commandes utiles

```bash
docker compose --env-file devops/.env -f devops/compose/compose.prod.yml restart
docker compose --env-file devops/.env -f devops/compose/compose.prod.yml down
```
