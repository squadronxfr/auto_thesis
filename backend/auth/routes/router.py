from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
import bcrypt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.config import settings
from backend.db.database import get_db
from jose import jwt, JWTError

user_router = APIRouter()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM


class RegisterRequest(BaseModel):
    last_name: str
    first_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

def extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Format invalide, attendu: Bearer <token>")
    return authorization.replace("Bearer ", "").strip()

@user_router.post("/register")
def register_user(user: RegisterRequest, db: Session = Depends(get_db)):
    # 1. Vérifier si l'email existe déjà
    existing_user = db.execute(
        text('SELECT id FROM "USER" WHERE email = :email'),
        {"email": user.email}
    ).fetchone()

    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")

    # 2. Hasher le mot de passe
    hashed_pw = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode('utf-8')

    # 3. Insérer l'utilisateur
    try:
        result = db.execute(
            text("""
                INSERT INTO "USER" (first_name, last_name, email, password, role)
                VALUES (:first_name, :last_name, :email, :password, 'USER')
                RETURNING id
            """),
            {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "password": hashed_pw
            }
        )
        user_id = result.scalar() # Récupérer l'ID généré
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

    # 4. Générer le token
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode(
        {"user_id": user_id, "sub": user.email, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    # 5. Enregistrer le token en base (optionnel mais prévu par la table TOKEN)
    try:
        db.execute(
            text("INSERT INTO token (token_string, user_id) VALUES (:token, :uid)"),
            {"token": token, "uid": user_id}
        )
        db.commit()
    except Exception:
        # On ne bloque pas l'inscription si l'insertion du token échoue (ou on retry)
        pass

    return {
        "message": "Utilisateur créé avec succès",
        "token": token,
        "user_id": user_id
    }


@user_router.post("/login")
def login_user(credentials: LoginRequest, db: Session = Depends(get_db)):
    # 1. Récupérer l'utilisateur
    user = db.execute(
        text('SELECT id, password, first_name, last_name FROM "USER" WHERE email = :email'),
        {"email": credentials.email}
    ).fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    user_id, stored_hash, first_name, last_name = user

    # 2. Vérifier le mot de passe
    if not bcrypt.checkpw(credentials.password.encode(), stored_hash.encode()):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    # 3. Générer le token
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode(
        {"user_id": user_id, "sub": credentials.email, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
 
    # 4. Enregistrer le token
    try:
        db.execute(
            text("INSERT INTO TOKEN (token_string, user_id) VALUES (:token, :uid)"),
            {"token": token, "uid": user_id}
        )
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"LOGIN ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la session: {str(e)}")

    return {
        "message": "Connexion réussie",
        "token": token,
        "user": {
            "id": user_id,
            "email": credentials.email,
            "first_name": first_name,
            "last_name": last_name
        }
    }

@user_router.post("/logout")
def logout_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    token_string = extract_bearer_token(authorization)

    try:
        jwt.decode(token_string, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")

    # Suppression synchrone
    result = db.execute(
        text("DELETE FROM token WHERE token_string = :token"),
        {"token": token_string}
    )
    db.commit()

    if result.rowcount == 0:
        # Note: Ce n'est pas forcément une erreur critique si le token n'est plus en base
        # Mais pour suivre la logique précédente :
        pass # ou raise HTTPException si strict

    return {"message": "Déconnexion réussie"}