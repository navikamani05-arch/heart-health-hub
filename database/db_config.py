from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Base
import os

DB_URL = "sqlite:///database/cardiorisk.db"

# Create the engine
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
