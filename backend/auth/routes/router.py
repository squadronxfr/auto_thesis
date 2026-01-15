from fastapi import APIRouter
from pydantic import BaseModel
import bcrypt
import uuid
from backend.config import settings
from jose import jwt

user_router = APIRouter()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    user_type: str


class LoginRequest(BaseModel):
    email: str
    password: str


@user_router.post("/register")
async def register_user(user: RegisterRequest):
    hashed_pw = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())
    user_id = str(uuid.uuid4())
    token = jwt.encode(
        {"user_id": user_id},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "message": "Utilisateur créé avec succès",
        "token": token,
        "user_id": user_id
    }


@user_router.post("/login")
async def login_user(credentials: LoginRequest):
    return {"message": "Login endpoint", "email": credentials.email}