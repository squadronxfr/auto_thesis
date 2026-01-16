# 🎯 Agent Artifact - Documentation

## 📋 Vue d'Ensemble

L'**Agent Artifact** est responsable de la **mémoire collective** du système multi-agents "Auto Thesis". Sa mission est simple et claire :

1. **💾 SAUVEGARDER** ce qui est produit par chaque agent
2. **📊 RÉSUMER** l'historique pour créer une 'mémoire' partagée  
3. **🔄 PARTAGER** cette mémoire avec les autres agents

## 🏗️ Architecture

```
Agent Artifact/
├── agents/
│   └── artifact.py           # Agent principal
├── db_models.py              # Modèles SQLAlchemy (PostgreSQL)
├── router.py                 # API FastAPI intégrée
├── test_artifact.py          # Tests
└── base.py                   # BaseAgent avec Gemini
```

## 🎯 Responsabilités

### 💾 Sauvegarde
- Stocke tous les outputs des agents dans `REQUEST_STEP`
- Enregistre les activités dans `ACTIVITY`
- Utilise le schéma PostgreSQL existant

### 📊 Génération de Mémoire
- Analyse l'historique des étapes d'un projet
- Génère un résumé intelligent avec Gemini
- Crée une mémoire condensée et utile

### 🔄 Partage de Mémoire
- Adapte le résumé selon l'agent demandeur
- Fournit un contexte personnalisé
- Optimise pour chaque type d'agent

## 🚀 API Endpoints (Intégré à l'API principale)

**Base URL:** `http://localhost:8000/api/v1/artifact`

### `POST /projects/{project_id}/save`
Sauvegarde la production d'un agent avec auto-création du projet
```python
# Paramètres Query
agent_name: str      # Nom de l'agent (ex: "ResearchAgent")
content: str         # Contenu produit (JSON encodé)
token_cost: int      # Coût en tokens (optionnel)

# Exemple
POST /api/v1/artifact/projects/1/save?agent_name=ResearchAgent&content={"research":"Test PostgreSQL"}&token_cost=100
```

### `GET /projects/{project_id}/memory`
Obtient le résumé de mémoire d'un projet
```json
{
  "memory_summary": "Résumé intelligent du projet...",
  "project_stats": {
    "total_steps": 5,
    "total_tokens": 1250,
    "recent_activities": ["ResearchAgent_output_saved", ...]
  }
}
```

### `GET /projects/{project_id}/shared-memory`
Fournit la mémoire adaptée pour un agent spécifique
```python
# Paramètres Query
agent_name: str      # Agent demandeur (ex: "JudgeAgent")

# Réponse
{
  "shared_memory": "Mémoire adaptée pour JudgeAgent...",
  "for_agent": "JudgeAgent",
  "project_stats": {...}
}
```

### `GET /projects/{project_id}/status`
État actuel d'un projet
```json
{
  "project_id": 1,
  "status": "active", 
  "total_steps": 8,
  "total_tokens": 2100,
  "created_at": "2026-01-16T..."
}
```

## 🔌 Intégration avec PostgreSQL

L'agent utilise une **base PostgreSQL distante** via ngrok et le schéma existant avec **auto-création des projets** :

### Configuration de la base distante :
```bash
Host: 2.tcp.eu.ngrok.io
Port: 19655
Database: appdb
User: admin
Password: admin
```

### Auto-création intelligente :
```sql
-- Si le projet n'existe pas, il est créé automatiquement
INSERT INTO request (id, user_id, status, created_at) VALUES (project_id, 1, 'active', NOW());

-- Sauvegarde dans REQUEST_STEP
INSERT INTO request_step (request_id, order_index, token_cost, content) VALUES (...);

-- Enregistre dans ACTIVITY  
INSERT INTO activity (name, request_id, created_at) VALUES (...);
```

### Logique de gestion :
- **Utilisateur par défaut** : ID = 1 (admin)
- **Projets auto-créés** : Statut "active" par défaut
- **Étapes incrémentales** : order_index calculé automatiquement
- **Tracking complet** : Chaque action enregistrée dans ACTIVITY

## 📊 Prompt de l'Agent

```
Tu es l'Agent Artifact, responsable de la mémoire collective du système Auto Thesis.

Ton rôle est simple et précis :
1. SAUVEGARDER tout ce que produisent les autres agents
2. RÉSUMER l'historique des actions pour créer une 'mémoire' partagée
3. PARTAGER cette mémoire avec les autres agents quand ils en ont besoin

Tu ne génères PAS de contenu académique.
Tu GÈRES uniquement la mémoire et les résumés.

Réponds toujours de manière structurée et factuelle.
```

## 🧪 Tests et Validation

### Tests Postman - Séquence complète :
```bash
# 1. Sauvegarder un output d'agent
POST http://localhost:8000/api/v1/artifact/projects/1/save?agent_name=ResearchAgent&content={"research":"Test PostgreSQL"}&token_cost=100

# 2. Vérifier le statut du projet
GET http://localhost:8000/api/v1/artifact/projects/1/status

# 3. Obtenir la mémoire du projet
GET http://localhost:8000/api/v1/artifact/projects/1/memory

# 4. Obtenir la mémoire partagée pour un agent
GET http://localhost:8000/api/v1/artifact/projects/1/shared-memory?agent_name=WritingAgent
```

### Tests automatisés :
```bash
# Test complet de l'agent
cd backend/agent/artifact
python test_artifact.py
```

## 🎯 Points Forts

1. **✅ Simple et focalisé** - Une seule responsabilité claire
2. **✅ PostgreSQL distant** - Base hébergée via ngrok (2.tcp.eu.ngrok.io:19655)
3. **✅ Auto-création** - Projets créés automatiquement si inexistants
4. **✅ Mémoire intelligente** - Résumés générés par Gemini
5. **✅ API intégrée** - Intégré dans l'API principale Auto Thesis
6. **✅ Testable** - Tests Postman et automatisés inclus

## 🔄 Utilisation dans le Pipeline

```python
# 1. Agent Research produit des résultats
research_output = {"research": "Sources trouvées...", "analysis": "Analyse..."}
# → POST /api/v1/artifact/projects/1/save?agent_name=ResearchAgent&content={...}&token_cost=150

# 2. Agent Writing demande la mémoire
# → GET /api/v1/artifact/projects/1/shared-memory?agent_name=WritingAgent
# → Reçoit un résumé adapté pour l'écriture

# 3. Agent Writing produit un texte  
writing_output = {"introduction": "...", "plan": "..."}
# → POST /api/v1/artifact/projects/1/save?agent_name=WritingAgent&content={...}&token_cost=300

# 4. Agent Judge évalue
judge_output = {"score": 85, "critique": "Bon travail mais..."}
# → POST /api/v1/artifact/projects/1/save?agent_name=JudgeAgent&content={...}&token_cost=100

# 5. Résumé global disponible
# → GET /api/v1/artifact/projects/1/memory
```

## 🔧 Configuration

### Variables d'Environnement (.env)
```bash
# Gemini API
GEMINI_API_KEY=your_key_here

# PostgreSQL distant via ngrok
DATABASE_URL=postgresql://admin:admin@2.tcp.eu.ngrok.io:19655/appdb

# Ou séparément
DATABASE_HOST=2.tcp.eu.ngrok.io
DATABASE_PORT=19655
DATABASE_NAME=appdb
DATABASE_USER=admin
DATABASE_PASSWORD=admin
```

### Démarrage intégré
```bash
# Démarrer l'API principale (inclut l'Agent Artifact)
cd auto_thesis
python -m backend.main

# → API disponible sur http://localhost:8000
# → Agent Artifact sur http://localhost:8000/api/v1/artifact/*
```

### État actuel ✅
- **Base de données** : Connectée et opérationnelle
- **Tables** : Créées avec schéma Auto Thesis
- **Utilisateur par défaut** : ID=1 (admin) créé
- **API intégrée** : Routeur artifact monté sur /api/v1/artifact
- **Tests validés** : Premier test Postman réussi

---

**L'Agent Artifact est maintenant opérationnel avec PostgreSQL distant et intégré à l'API Auto Thesis !**