"""
Script pour créer un utilisateur par défaut 
nécessaire pour les projets auto-créés
"""
import sys
import os

# Ajout du chemin
current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

from db_models import engine, SessionLocal, User
from datetime import datetime

def create_default_user():
    """Créer un utilisateur par défaut pour l'Agent Artefact"""
    db = SessionLocal()
    try:
        # Vérifier si l'utilisateur par défaut existe
        existing_user = db.query(User).filter(User.id == 1).first()
        
        if not existing_user:
            print("🔄 Création de l'utilisateur par défaut...")
            
            default_user = User(
                id=1,  # Forcer l'ID
                first_name="Agent",
                last_name="Artefact", 
                email="agent.artefact@auto-thesis.com",
                password="hashed_password_placeholder",  # À remplacer par un hash réel
                role="ADMIN",
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            db.add(default_user)
            db.commit()
            print("✅ Utilisateur par défaut créé (ID: 1)")
        else:
            print("✅ Utilisateur par défaut existe déjà (ID: 1)")
            
        return True
        
    except Exception as e:
        print(f"❌ Erreur création utilisateur: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = create_default_user()
    if success:
        print("\n🎉 Utilisateur par défaut prêt !")
    else:
        print("\n💥 Échec création utilisateur")
        sys.exit(1)