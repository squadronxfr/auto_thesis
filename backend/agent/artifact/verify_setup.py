"""
🔑 Vérification de la clé API Gemini
Ce script teste si votre clé API fonctionne correctement
"""

import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# Charge les variables d'environnement
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

def test_gemini_api():
    """Test de la clé API Gemini"""
    
    print("🔑 TEST CLEF API GEMINI")
    print("=" * 30)
    
    # Récupération de la clé
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("❌ ERREUR: Variable GEMINI_API_KEY non trouvée dans .env")
        return False
    
    print(f"✅ Clé API trouvée: {api_key[:20]}...")
    
    try:
        # Configuration Gemini
        genai.configure(api_key=api_key)
        
        # Test simple avec modèle standard
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        print("🧪 Test de génération...")
        
        response = model.generate_content(
            "Réponds juste 'OK' si tu reçois ce message",
            generation_config={"max_output_tokens": 10, "temperature": 0}
        )
        
        if response.text:
            print(f"✅ Réponse Gemini: '{response.text.strip()}'")
            print("🎉 CLEF API FONCTIONNELLE !")
            return True
        else:
            print("❌ Aucune réponse de Gemini")
            return False
            
    except Exception as e:
        print(f"❌ ERREUR API Gemini: {str(e)}")
        
        # Diagnostics
        if "API_KEY_INVALID" in str(e):
            print("💡 La clé API semble invalide")
        elif "QUOTA_EXCEEDED" in str(e):
            print("💡 Quota API dépassé")
        elif "PERMISSION_DENIED" in str(e):
            print("💡 Permissions insuffisantes")
        else:
            print("💡 Erreur de connexion ou configuration")
        
        return False

def test_integration_with_agent():
    """Test d'intégration avec l'Agent Artefact"""
    
    print("\n🤖 TEST INTEGRATION AGENT")
    print("=" * 30)
    
    try:
        # Import de l'agent (chemin absolu)
        import sys
        import os
        current_dir = os.path.dirname(__file__)
        sys.path.insert(0, current_dir)
        
        from agents.artifact import ArtifactAgent
        
        # Test de création
        agent = ArtifactAgent()
        print(f"✅ Agent créé: {agent.config.name}")
        print(f"🎯 Rôle: {agent.config.role}")
        print(f"🌡️ Température: {agent.config.temperature}")
        
        # Test du modèle Gemini intégré
        if hasattr(agent, 'model'):
            print("✅ Modèle Gemini intégré dans l'agent")
            return True
        else:
            print("❌ Modèle Gemini non accessible")
            return False
            
    except ImportError as e:
        print(f"❌ Impossible d'importer l'agent: {e}")
        return False
    except Exception as e:
        print(f"❌ Erreur agent: {e}")
        return False

if __name__ == "__main__":
    print("🚀 VERIFICATION CONFIGURATION")
    print("=" * 40)
    
    # Test 1: API Gemini
    api_ok = test_gemini_api()
    
    # Test 2: Integration Agent
    agent_ok = test_integration_with_agent()
    
    # Résumé
    print("\n📊 RESULTAT FINAL")
    print("=" * 20)
    
    if api_ok and agent_ok:
        print("🎉 TOUT FONCTIONNE ! Prêt pour les tests Postman")
        print("\n🚀 Étapes suivantes:")
        print("1. Démarrer Redis: redis-server")
        print("2. Lancer l'API: python main.py") 
        print("3. Tester avec Postman: http://localhost:8001/health")
    else:
        print("❌ CONFIGURATION INCOMPLÈTE")
        if not api_ok:
            print("- Vérifier la clé API Gemini")
        if not agent_ok:
            print("- Vérifier l'installation des dépendances")
        
        print("\n🔧 Dépendances requises:")
        print("pip install google-generativeai python-dotenv redis fastapi uvicorn")