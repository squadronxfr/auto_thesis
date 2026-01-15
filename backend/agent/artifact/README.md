# 🎯 Agent Artefact - Documentation Technique

## 📋 Vue d'Ensemble

L'**Agent Artefact** est le cerveau mémoire du système multi-agents "Auto Thesis". Il gère la persistance, la traçabilité et le partage de contexte entre tous les agents du pipeline.

## 🏗️ Architecture

```
Agent Artefact/
├── agents/
│   └── artifact.py          # Agent principal
├── models/
│   └── data_models.py       # Modèles Pydantic (ER Schema)
├── redis_manager.py         # Persistance Redis
├── main.py                  # API FastAPI
└── test_artifact.py         # Tests et exemples
```

## 🎯 Responsabilités Principales

### 1. 💾 **Sauvegarde Versionnée**
- Archive chaque étape du pipeline avec métadonnées
- Versioning intelligent (V1.0 → V1.1 → V2.0)
- Calcul automatique des coûts tokens
- Horodatage précis de toutes les actions

### 2. 📊 **Traçabilité Complète**  
- Historique détaillé de chaque modification
- Mapping Agent → Action → Résultat
- Métriques de performance par étape
- Analytics prédictifs sur la progression

### 3. 🎯 **État Global et Synthèse**
- Dashboard temps réel du projet
- Calcul automatique de progression (%)  
- Identification des goulots d'étranglement
- Recommandations d'optimisation

### 4. 🔄 **Contexte Partagé**
- Mémoire contextuelle pour chaque agent
- Évite la répétition d'erreurs connues
- Partage des bonnes pratiques validées
- Cohérence stylistique globale

## 📊 Modèle de Données (Basé sur ER Schema)

### Entités Principales

```python
# Demande utilisateur
Request:
  - id, name, status, created_at
  - Relations: HAS_STEP → RequestStep, TRACK → Activity

# Étapes granulaires  
RequestStep:
  - order_index, token_cost, content
  - agent_type, agent_mode, quality_score
  - iteration_number (pour versioning)

# Journal des activités
Activity:  
  - name, activity_type, agent_name
  - duration, input/output tokens
  - metadata (contexte libre)

# Documents produits
Document:
  - name, document_type, version
  - content, is_final
  - Relations: CONTAIN ← Request, OWN ← User

# Gestion utilisateurs
User:
  - first_name, last_name, email
  - role (USER, ADMIN, etc.)
  - Relations: CREATE → Request, OWN → Token
```

### Structures de Mémoire

```python
# Contexte partagé entre agents
MemoryContext:
  - previous_activities, previous_feedbacks
  - total_tokens_used, average_quality_score
  - validated_style, recurring_issues
  - key_sources, project_progression

# Snapshot complet du projet
ProjectSnapshot:
  - all_steps, all_documents, all_activities
  - quality_evolution, efficiency_metrics
  - snapshot_name, timestamp

# Mémoire principale
ArtifactMemory:
  - context: MemoryContext
  - snapshots: List[ProjectSnapshot]
  - cached_summaries, cached_recommendations
  - analytics prédictifs
```

## 🔄 Intégration avec le Pipeline

### Flux Standard

```
1. 📥 User Request
   └─ Artifact: create_project_memory()

2. 🔍 Agent Recherche  
   ├─ Artifact: provide_context_for_agent(RESEARCH)
   └─ Artifact: archive_step(research_result)

3. ✍️ Agent Écriture
   ├─ Artifact: provide_context_for_agent(WRITING, "MODE_METHODOLOGY")  
   └─ Artifact: archive_step(writing_result)

4. ⚖️ Agent Judge
   ├─ Artifact: provide_context_for_agent(JUDGING, "JUDGE_METHODOLOGY")
   └─ Artifact: archive_step(judge_verdict)

5. 🔄 Agent Réécriture (si nécessaire)
   ├─ Artifact: provide_context_for_agent(REWRITING)
   └─ Artifact: archive_step(rewrite_result)

6. 📸 Snapshot Final
   └─ Artifact: create_smart_snapshot("Section_Completed")
```

### Contexte Spécialisé par Agent

**✍️ Agent Écriture reçoit :**
```python
{
  "validated_style": {"tone": "académique", "level": "master"},
  "key_sources": [sources pertinentes trouvées],
  "previous_critiques_to_avoid": [erreurs récurrentes],
  "suggested_approach": "Approche recommandée basée sur l'historique"
}
```

**⚖️ Agent Judge reçoit :**
```python
{
  "previous_scores": [72, 85, 91],  # Évolution qualité
  "common_issues": ["Style trop familier", "Manque références"],
  "benchmark_criteria": "Critères adaptés au type de contenu"
}
```

**🔄 Agent Réécriture reçoit :**
```python
{
  "specific_critiques": [critiques du dernier Judge],
  "improvement_suggestions": [améliorations concrètes],
  "success_patterns": [patterns d'améliorations réussies]
}
```

## 🚀 API Endpoints

### Gestion Projets
```http
POST   /projects/{id}/initialize     # Créer mémoire projet
POST   /projects/{id}/steps          # Archiver étape
GET    /projects/{id}/context/{agent} # Contexte agent
GET    /projects/{id}/dashboard      # Dashboard complet
GET    /projects                     # Lister projets actifs
```

### Snapshots  
```http
POST   /projects/{id}/snapshots      # Créer snapshot
GET    /projects/{id}/snapshots      # Lister snapshots
```

### Administration
```http
GET    /admin/stats                  # Stats globales
POST   /admin/cleanup               # Nettoyage données
POST   /projects/{id}/backup        # Backup projet
POST   /projects/restore            # Restore projet
```

### Monitoring
```http
GET    /health                      # Santé service
```

## ⚡ Optimisations Redis

### Cache Intelligent
- **Contextes agents** : TTL 30min
- **Mémoires projets** : TTL 7 jours  
- **Snapshots** : Persistance permanente
- **Métadonnées** : Compression JSON

### Performance
- **Index secondaires** pour recherche rapide
- **Cleanup automatique** des données expirées
- **Backup/restore** pour récupération
- **Métriques** Redis intégrées

## 🧪 Tests et Validation

### Script de Test
```bash
cd backend/agent/artifact
python test_artifact.py
```

### Couverture Tests
- ✅ Création/récupération mémoire
- ✅ Archivage étapes avec métadonnées
- ✅ Génération contexte spécialisé
- ✅ Snapshots et versioning
- ✅ Performance cache Redis
- ✅ Intégration pipeline complet

## 📈 Métriques et Analytics

### Métriques Clés
- **Progression globale** (%) basée sur étapes complétées
- **Efficacité tokens** (tokens/qualité obtenue)  
- **Vitesse convergence** (itérations pour validation)
- **Patterns d'erreurs** détectés automatiquement

### Insights Générés
- **Prédictions** tokens restants
- **Recommandations** d'optimisation
- **Alertes** sur dérive qualité
- **Benchmarks** comparatifs

## 🔧 Configuration

### Variables d'Environnement
```bash
REDIS_HOST=localhost
REDIS_PORT=6379  
REDIS_DB=0
GEMINI_API_KEY=your_key_here
```

### Configuration Redis
```python
# Persistance données critiques
redis_manager = RedisMemoryManager(
    redis_host="localhost",
    redis_port=6379,
    redis_db=0
)
```

## 🎯 Points Forts de l'Implémentation

### ✅ **Cohérence Architecturale**
- Respect du schéma ER fourni
- Intégration native avec `BaseAgent` existant  
- API RESTful standard

### ✅ **Scalabilité**
- Support multi-projets simultanés
- Redis cluster-ready
- Métadonnées extensibles

### ✅ **Intelligence Collective**  
- Apprentissage des patterns d'erreurs
- Optimisation automatique des prompts
- Recommandations contextuelles

### ✅ **Monitoring Complet**
- Health checks intégrés
- Métriques temps réel
- Alertes proactives

L'Agent Artefact transforme une collection d'agents indépendants en un **système intelligent qui apprend et s'améliore** à chaque utilisation ! 🧠✨