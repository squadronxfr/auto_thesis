import google.generativeai as genai
from backend.config.settings import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

print("🔍 Recherche des modèles disponibles pour ta clé...\n")

try:
    available_models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"DISPONIBLE : {m.name}")
            available_models.append(m.name)
            
    if not available_models:
        print("\nAucun modèle trouvé. Vérifie ta clé API.")
    else:
        print("\nCopie l'un des noms ci-dessus (sans le 'models/') dans ton fichier base.py")
        
except Exception as e:
    print(f"Erreur : {e}")