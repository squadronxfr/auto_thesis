# Documentation Backend - Auto Thesis

Cette documentation détaille l'architecture du backend et les étapes nécessaires à sa mise en place.

## Architecture

Le backend est divisé en deux composants principaux :
1. **API FastAPI (Python)** : Gère la logique métier, l'authentification, et la coordination des agents.
2. **Serveur MCP (Node.js)** : Fournit des outils spécifiques (recherche, lecture de PDF, etc.) via le protocole Model Context Protocol.

### Structure des dossiers
- `agent/` : Contient la logique des différents agents (recherche, écriture, juge, artefact).
- `auth/` : Gestion des utilisateurs et de l'authentification.
- `config/` : Configuration globale de l'application.
- `mcp/` : Serveur Node.js fournissant les outils MCP.

## Prérequis

- Python 3.10+
- Node.js 18+
- Docker et Docker Compose
- Un environnement virtuel Python (recommandé)

## Installation

### 1. Backend FastAPI
Depuis le dossier `backend` :
```bash
# Installation des dépendances Python
pip install -r requirements.txt
```

### 2. Serveur MCP
Depuis le dossier `backend/mcp` :
```bash
# Installation des dépendances Node.js
npm install
```

## Configuration

Deux fichiers d'environnement sont nécessaires :

1. **`backend/.env`** : Configuration de l'API FastAPI (Base de données, Clés API AI, JWT).
2. **`backend/mcp/.env`** : Configuration du serveur MCP (Port, Clés API pour les outils de recherche).

## Mise en place et Lancement

### Lancement du serveur MCP (Docker)
Le serveur MCP doit être lancé via Docker pour assurer l'isolement des outils.
Depuis le dossier `backend/mcp` :
```bash
docker-compose up -d
```
Le serveur sera accessible par défaut sur le port 3000.

### Lancement du backend FastAPI
Depuis le dossier `backend` :
```bash
fastapi dev main.py
```
L'API sera disponible sur `http://localhost:8000`. La documentation Swagger est accessible sur `/docs`.

## Commandes utiles

- **Arrêter le MCP** : `docker-compose down` dans `backend/mcp`.
- **Logs du MCP** : `docker-compose logs -f` dans `backend/mcp`.
- **Relancer le backend** : `fastapi dev main.py` (le rechargement automatique est activé par défaut).
