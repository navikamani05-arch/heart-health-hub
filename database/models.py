from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    health_goals = relationship("HealthGoal", back_populates="user", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = 'predictions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Store stringified inputs if needed or just specific summary
    input_summary = Column(Text, nullable=False)
    full_inputs = Column(Text, nullable=True) # Full JSON of all 21 inputs
    
    # Model Outputs
    risk_score = Column(Float, nullable=False)
    risk_category = Column(String(20), nullable=False)
    top_shap_features = Column(Text, nullable=False) # Store JSON string of top features
    
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="predictions")

class HealthGoal(Base):
    __tablename__ = 'health_goals'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    goal = Column(String(200), nullable=False)
    status = Column(String(20), default="active") # active, achieved, abandoned
    
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="health_goals")
