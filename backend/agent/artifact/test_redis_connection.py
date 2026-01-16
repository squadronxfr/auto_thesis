"""
🧪 Test de Connexion Redis pour Agent Artefact
"""
import redis
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

def test_redis_connection():
    """Test de base de la connexion Redis"""
    
    print("🔄 TEST CONNEXION REDIS")
    print("=" * 30)
    
    try:
        import os
        redis_password = os.getenv("REDIS_PASSWORD", "")
        
        # Configuration de connexion
        connection_params = {
            'host': 'localhost',
            'port': 6379,
            'db': 0,
            'decode_responses': True,
            'socket_timeout': 5,
            'socket_connect_timeout': 5
        }
        
        # Ajout du mot de passe s'il existe
        if redis_password:
            connection_params['password'] = redis_password
            print(f"🔐 Connexion avec authentification")
        
        # Tentative de connexion
        client = redis.Redis(**connection_params)
        
        # Test ping
        response = client.ping()
        if response:
            print("✅ Connexion Redis réussie !")
            
            # Test d'écriture/lecture
            test_key = "artifact:test:connection"
            test_data = {
                "message": "Hello from Agent Artefact",
                "timestamp": datetime.now().isoformat(),
                "test_number": 42
            }
            
            # Écriture
            client.setex(test_key, 60, json.dumps(test_data))  # Expire en 60s
            print("✅ Données écrites dans Redis")
            
            # Lecture
            retrieved_data = client.get(test_key)
            if retrieved_data:
                parsed_data = json.loads(retrieved_data)
                print(f"✅ Données récupérées: {parsed_data['message']}")
                print(f"📅 Timestamp: {parsed_data['timestamp']}")
                
                # Nettoyage
                client.delete(test_key)
                print("✅ Données de test supprimées")
                
                return True
            else:
                print("❌ Impossible de récupérer les données")
                return False
                
        else:
            print("❌ Redis ne répond pas au ping")
            return False
            
    except redis.ConnectionError:
        print("❌ ERREUR: Impossible de se connecter à Redis")
        print("💡 Vérifiez que Redis est démarré sur localhost:6379")
        return False
    except redis.TimeoutError:
        print("❌ ERREUR: Timeout de connexion Redis")
        return False
    except Exception as e:
        print(f"❌ ERREUR inattendue: {e}")
        return False

def test_redis_features():
    """Test des fonctionnalités Redis utilisées par l'Agent Artefact"""
    
    print("\n🔧 TEST FONCTIONNALITÉS REDIS")
    print("=" * 35)
    
    try:
        import os
        redis_password = os.getenv("REDIS_PASSWORD", "")
        
        connection_params = {
            'host': 'localhost', 
            'port': 6379, 
            'db': 0, 
            'decode_responses': True
        }
        
        if redis_password:
            connection_params['password'] = redis_password
        
        client = redis.Redis(**connection_params)
        
        # Test 1: Sets (pour index)
        print("🧪 Test 1: Sets (index des projets)")
        client.sadd("artifact:test:projects", "project1", "project2", "project3")
        projects = client.smembers("artifact:test:projects")
        print(f"✅ Projets indexés: {list(projects)}")
        
        # Test 2: Lists (pour snapshots)
        print("\n🧪 Test 2: Lists (historique snapshots)")
        client.lpush("artifact:test:snapshots", "snapshot1", "snapshot2", "snapshot3")
        snapshots = client.lrange("artifact:test:snapshots", 0, 2)
        print(f"✅ Snapshots récents: {snapshots}")
        
        # Test 3: Expiration (pour cache)
        print("\n🧪 Test 3: Expiration (cache temporaire)")
        client.setex("artifact:test:cache", 5, "cached_data")  # Expire en 5s
        ttl = client.ttl("artifact:test:cache")
        print(f"✅ Cache TTL: {ttl} secondes")
        
        # Test 4: Hash (pour métadonnées)
        print("\n🧪 Test 4: Hash (métadonnées projet)")
        client.hset("artifact:test:metadata", mapping={
            "project_name": "Test Project",
            "total_tokens": "1500",
            "progression": "45.5"
        })
        metadata = client.hgetall("artifact:test:metadata")
        print(f"✅ Métadonnées: {dict(metadata)}")
        
        # Nettoyage des tests
        print("\n🧹 Nettoyage...")
        test_keys = [
            "artifact:test:projects",
            "artifact:test:snapshots", 
            "artifact:test:cache",
            "artifact:test:metadata"
        ]
        
        for key in test_keys:
            if client.exists(key):
                client.delete(key)
        
        print("✅ Données de test nettoyées")
        print("🎉 TOUS LES TESTS REDIS RÉUSSIS !")
        
        return True
        
    except Exception as e:
        print(f"❌ ERREUR durant les tests: {e}")
        return False

def get_redis_info():
    """Informations sur l'instance Redis"""
    
    print("\n📊 INFORMATIONS REDIS")
    print("=" * 25)
    
    try:
        import os
        redis_password = os.getenv("REDIS_PASSWORD", "")
        
        connection_params = {
            'host': 'localhost', 
            'port': 6379, 
            'db': 0
        }
        
        if redis_password:
            connection_params['password'] = redis_password
        
        client = redis.Redis(**connection_params)
        info = client.info()
        
        print(f"🗄️ Version Redis: {info.get('redis_version', 'N/A')}")
        print(f"💾 Mémoire utilisée: {info.get('used_memory_human', 'N/A')}")
        print(f"🔑 Nombre de clés: {info.get('db0', {}).get('keys', 0) if 'db0' in info else 0}")
        print(f"🔗 Connexions: {info.get('connected_clients', 'N/A')}")
        print(f"⚡ Uptime: {info.get('uptime_in_seconds', 0)} secondes")
        
        return True
        
    except Exception as e:
        print(f"❌ Impossible de récupérer les infos Redis: {e}")
        return False

if __name__ == "__main__":
    print("🚀 TEST COMPLET REDIS POUR AGENT ARTEFACT")
    print("=" * 50)
    
    # Test 1: Connexion de base
    connection_ok = test_redis_connection()
    
    if connection_ok:
        # Test 2: Fonctionnalités avancées
        features_ok = test_redis_features()
        
        # Test 3: Informations système
        get_redis_info()
        
        if features_ok:
            print("\n🎉 REDIS PRÊT POUR L'AGENT ARTEFACT !")
            print("🚀 Vous pouvez maintenant démarrer l'API avec persistance complète")
        else:
            print("\n⚠️ Redis fonctionne mais certaines fonctionnalités échouent")
    else:
        print("\n❌ REDIS NON DISPONIBLE")
        print("📋 Étapes de dépannage :")
        print("1. Vérifiez que Redis est installé")
        print("2. Démarrez Redis server (redis-server)")
        print("3. Vérifiez le port 6379")
        print("4. Consultez REDIS_SETUP.md pour l'installation")