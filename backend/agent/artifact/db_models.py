from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
from enum import Enum
import os
from dotenv import load_dotenv

load_dotenv()

# ===== ENUMS =====

class ActivityType(str, Enum):
    RESEARCH = "RESEARCH"
    WRITING = "WRITING"
    JUDGING = "JUDGING"
    REWRITING = "REWRITING"
    ARCHIVING = "ARCHIVING"

class RequestStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class DocumentType(str, Enum):
    SOURCE = "SOURCE"
    FINAL = "FINAL"

# Configuration de la base de données PostgreSQL distante
DATABASE_URL = f"postgresql://admin:admin@2.tcp.eu.ngrok.io:19655/appdb"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "connect_timeout": 10,
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dépendance FastAPI pour les sessions de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== MODÈLES SQLALCHEMY =====

class User(Base):
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(Text, nullable=False)
    last_name = Column(Text, nullable=False)
    email = Column(Text, nullable=False, unique=True)
    password = Column(Text, nullable=False)
    role = Column(Text, nullable=False, default="USER")
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    # Relations
    requests = relationship("Request", back_populates="user")
    tokens = relationship("Token", back_populates="user")
    documents = relationship("Document", back_populates="user")

class Token(Base):
    __tablename__ = "token"
    
    id = Column(Integer, primary_key=True, index=True)
    token_string = Column(Text, nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="tokens")

class Request(Base):
    __tablename__ = "request"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    status = Column(Text, nullable=False, default="IN_PROGRESS")  # IN_PROGRESS, COMPLETED
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="requests")
    request_steps = relationship("RequestStep", back_populates="request")
    activities = relationship("Activity", back_populates="request")
    documents = relationship("Document", back_populates="request")

class RequestStep(Base):
    __tablename__ = "request_step"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    token_cost = Column(Integer, nullable=False, default=0)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    # Relations
    request = relationship("Request", back_populates="request_steps")

class Activity(Base):
    __tablename__ = "activity"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    request_id = Column(Integer, ForeignKey("request.id"), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    # Relations
    request = relationship("Request", back_populates="activities")

class Document(Base):
    __tablename__ = "document"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    document_type = Column(Text, nullable=False)  # SOURCE, FINAL
    request_id = Column(Integer, ForeignKey("request.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    # Relations
    request = relationship("Request", back_populates="documents")
    user = relationship("User", back_populates="documents")