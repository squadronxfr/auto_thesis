"""
🧪 Tests et Exemple d'Usage de l'Agent Artefact

Ce script démontre comment utiliser l'Agent Artefact dans le pipeline multi-agents.
"""

import asyncio
import json
from datetime import datetime
import uuid

# Import des composants
from agents.artifact import ArtifactAgent
from redis_manager import RedisMemoryManager
from models.data_models import (
    Request, RequestStep, Activity, 
    ActivityType, RequestStatus, DocumentType
)

async def demo_artifact_workflow():
    """
    🎬 Démonstation complète du workflow de l'Agent Artefact
    """
    print("🎯 DÉMO AGENT ARTEFACT - MÉMOIRE COLLECTIVE")
    print("=" * 50)
    
    # Initialisation
    artifact_agent = ArtifactAgent()
    redis_manager = RedisMemoryManager()
    
    # 1. ===== CRÉATION D'UN NOUVEAU PROJET =====
    print("\n📝 1. CRÉATION PROJET")
    request_id = str(uuid.uuid4())
    request = Request(
        id=request_id,
        name="Thèse IA - Apprentissage Multi-Agents",
        status=RequestStatus.IN_PROGRESS
    )
    
    memory = await artifact_agent.create_project_memory(request)
    await redis_manager.store_memory(memory)
    
    print(f"✅ Projet créé: {request.name}")
    print(f"📍 Request ID: {request_id}")
    
    # 2. ===== SIMULATION ÉTAPE RECHERCHE =====
    print("\n🔍 2. ÉTAPE RECHERCHE")
    research_step = RequestStep(
        id=str(uuid.uuid4()),
        request_id=request_id,
        order_index=1,
        token_cost=850,
        content="Recherche sur apprentissage multi-agents: 12 sources académiques trouvées...",
        agent_type=ActivityType.RESEARCH,
        agent_mode="SOURCE_COLLECTION",
        iteration_number=1
    )
    
    result = await artifact_agent.archive_step(research_step)
    await redis_manager.store_memory(artifact_agent.memory_store[request_id])
    
    print(f"✅ Recherche archivée: {result['step_id'][:8]}...")
    print(f"📊 Progression: {result['progression']:.1f}%")
    
    # 3. ===== SIMULATION ÉTAPE ÉCRITURE =====
    print("\n✍️ 3. ÉTAPE ÉCRITURE")
    writing_step = RequestStep(
        id=str(uuid.uuid4()),
        request_id=request_id,
        order_index=2,
        token_cost=1250,
        content="Section méthodologie générée: approche expérimentale avec 3 phases...",
        agent_type=ActivityType.WRITING,
        agent_mode="MODE_METHODOLOGY",
        iteration_number=1
    )
    
    result = await artifact_agent.archive_step(writing_step)
    await redis_manager.store_memory(artifact_agent.memory_store[request_id])
    
    print(f"✅ Écriture archivée: {result['step_id'][:8]}...")
    print(f"📊 Progression: {result['progression']:.1f}%")
    
    # 4. ===== SIMULATION ÉTAPE JUDGE =====
    print("\n⚖️ 4. ÉTAPE ÉVALUATION")
    judge_step = RequestStep(
        id=str(uuid.uuid4()),
        request_id=request_id,
        order_index=3,
        token_cost=420,
        content="Évaluation: Score 72/100, 3 critiques identifiées...",
        agent_type=ActivityType.JUDGING,
        agent_mode="JUDGE_METHODOLOGY",
        quality_score=72,
        iteration_number=1
    )
    
    result = await artifact_agent.archive_step(judge_step)
    await redis_manager.store_memory(artifact_agent.memory_store[request_id])
    
    print(f"✅ Jugement archivé: Score {judge_step.quality_score}/100")
    print(f"📊 Progression: {result['progression']:.1f}%")
    
    # 5. ===== CONTEXTE POUR AGENT RÉÉCRITURE =====
    print("\n🔄 5. CONTEXTE POUR RÉÉCRITURE")
    rewrite_context = await artifact_agent.provide_context_for_agent(
        request_id, 
        ActivityType.REWRITING
    )
    
    print("📋 Contexte fourni à l'Agent Réécriture:")
    print(f"   - Étape courante: {rewrite_context['current_step']}")
    print(f"   - Tokens utilisés: {rewrite_context['total_tokens_used']}")
    print(f"   - Qualité moyenne: {rewrite_context['average_quality']}")
    print(f"   - Critiques à traiter: {len(rewrite_context.get('specific_critiques', []))}")
    
    # 6. ===== SIMULATION RÉÉCRITURE =====
    print("\n🔧 6. ÉTAPE RÉÉCRITURE")
    rewrite_step = RequestStep(
        id=str(uuid.uuid4()),
        request_id=request_id,
        order_index=4,
        token_cost=980,
        content="Section méthodologie améliorée: intégration des 3 critiques...",
        agent_type=ActivityType.REWRITING,
        quality_score=87,
        iteration_number=2
    )
    
    result = await artifact_agent.archive_step(rewrite_step)
    await redis_manager.store_memory(artifact_agent.memory_store[request_id])
    
    print(f"✅ Réécriture archivée: Score amélioré à {rewrite_step.quality_score}/100")
    print(f"📊 Progression: {result['progression']:.1f}%")
    
    # 7. ===== CRÉATION SNAPSHOT =====
    print("\n📸 7. CRÉATION SNAPSHOT")
    snapshot = await artifact_agent.create_smart_snapshot(
        request_id, 
        "Milestone_Methodology_Completed"
    )
    await redis_manager.store_snapshot(snapshot)
    
    print(f"✅ Snapshot créé: {snapshot.snapshot_name}")
    print(f"📊 Tokens total: {snapshot.total_token_cost}")
    print(f"🎯 Qualité moyenne: {sum(snapshot.quality_evolution)/len(snapshot.quality_evolution):.1f}/100")
    
    # 8. ===== DASHBOARD COMPLET =====
    print("\n📊 8. DASHBOARD PROJET")
    dashboard = await artifact_agent.get_project_dashboard(request_id)
    
    print("📈 Vue d'ensemble:")
    print(f"   - Progression: {dashboard['overview']['progression']:.1f}%")
    print(f"   - Étapes complétées: {dashboard['overview']['current_step']}")
    print(f"   - Budget tokens: {dashboard['overview']['total_tokens']}")
    print(f"   - Dernière MAJ: {dashboard['overview']['last_updated'][:19]}")
    
    # 9. ===== INSIGHTS INTELLIGENTS =====
    print("\n💡 9. INSIGHTS PROJET")
    insights = await artifact_agent.generate_project_insights(request_id)
    
    print("🔍 Recommandations:")
    for i, rec in enumerate(insights.get('recommendations', []), 1):
        print(f"   {i}. {rec}")
    
    # 10. ===== STATISTIQUES REDIS =====
    print("\n📈 10. STATS GLOBALES")
    stats = await redis_manager.get_global_stats()
    
    print(f"🗂️ Projets actifs: {stats.get('active_projects', 0)}")
    print(f"💾 Mémoire Redis: {stats.get('redis_memory_mb', 0)} MB")
    print(f"📊 Progression moyenne: {stats.get('average_progression', 0):.1f}%")
    
    print("\n🎉 DÉMO TERMINÉE - Agent Artefact opérationnel !")
    return request_id

async def demo_cache_performance():
    """
    ⚡ Démonstration des performances de cache
    """
    print("\n⚡ TEST PERFORMANCE CACHE")
    print("=" * 30)
    
    redis_manager = RedisMemoryManager()
    artifact_agent = ArtifactAgent()
    
    # Simulation d'un contexte complexe
    test_context = {
        "validated_style": {"tone": "académique", "level": "master"},
        "key_sources": [{"title": "Source 1", "relevance": 0.9}] * 50,
        "suggestions": ["Suggestion " + str(i) for i in range(100)]
    }
    
    # Test mise en cache
    start_time = datetime.now()
    await redis_manager.cache_agent_context("test_request", "writing", test_context)
    cache_time = (datetime.now() - start_time).total_seconds() * 1000
    
    # Test récupération
    start_time = datetime.now()
    cached_result = await redis_manager.get_cached_context("test_request", "writing")
    retrieve_time = (datetime.now() - start_time).total_seconds() * 1000
    
    print(f"✅ Cache stockage: {cache_time:.2f}ms")
    print(f"⚡ Cache récupération: {retrieve_time:.2f}ms")
    print(f"📊 Taille données: {len(str(cached_result))} caractères")

async def demo_integration_example():
    """
    🔗 Exemple d'intégration avec d'autres agents
    """
    print("\n🔗 EXEMPLE INTÉGRATION AGENTS")
    print("=" * 35)
    
    # Simulation d'appel depuis Agent Écriture
    artifact_agent = ArtifactAgent()
    request_id = "example_integration_project"
    
    # 1. Agent Écriture demande du contexte
    print("✍️ Agent Écriture demande contexte...")
    context = await artifact_agent.provide_context_for_agent(
        request_id,
        ActivityType.WRITING,
        "MODE_METHODOLOGY"
    )
    
    print(f"📨 Contexte fourni: {len(context)} éléments")
    
    # 2. Agent Écriture soumet son résultat
    print("📝 Agent Écriture soumet résultat...")
    writing_result = RequestStep(
        id=str(uuid.uuid4()),
        request_id=request_id,
        order_index=1,
        token_cost=1500,
        content="Section méthodologie générée avec approche mixte...",
        agent_type=ActivityType.WRITING,
        agent_mode="MODE_METHODOLOGY"
    )
    
    await artifact_agent.archive_step(writing_result)
    print("✅ Résultat archivé")
    
    # 3. Agent Judge demande contexte pour évaluation
    print("⚖️ Agent Judge demande contexte d'évaluation...")
    judge_context = await artifact_agent.provide_context_for_agent(
        request_id,
        ActivityType.JUDGING,
        "JUDGE_METHODOLOGY"
    )
    
    print(f"📊 Contexte d'évaluation: {len(judge_context)} critères")
    print("🎯 Chaîne d'agents interconnectée avec succès !")

if __name__ == "__main__":
    print("🚀 LANCEMENT TESTS AGENT ARTEFACT")
    print("=" * 40)
    
    # Lancement des démos
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Démo principale
        request_id = loop.run_until_complete(demo_artifact_workflow())
        
        # Démo performance
        loop.run_until_complete(demo_cache_performance())
        
        # Démo intégration
        loop.run_until_complete(demo_integration_example())
        
        print(f"\n🎉 TOUS LES TESTS RÉUSSIS !")
        print(f"📍 Projet de test créé: {request_id[:8]}...")
        
    except Exception as e:
        print(f"❌ Erreur durant les tests: {e}")
    finally:
        loop.close()