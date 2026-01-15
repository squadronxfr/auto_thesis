import google.generativeai as genai
import os
from dotenv import load_dotenv

# Charge la clé
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("🔍 Recherche des modèles disponibles pour ta clé...\n")

try:
    available_models = []
    for m in genai.list_models():
        # On cherche uniquement les modèles qui savent générer du texte
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ DISPONIBLE : {m.name}")
            available_models.append(m.name)
            
    if not available_models:
        print("\n❌ Aucun modèle trouvé. Vérifie ta clé API.")
    else:
        print("\n👉 Copie l'un des noms ci-dessus (sans le 'models/') dans ton fichier base.py")
        
except Exception as e:
    print(f"❌ Erreur : {e}")