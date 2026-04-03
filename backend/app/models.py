from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from pydantic import BaseModel

try:
    from .database import Base
except ImportError:
    from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    weight = Column(Integer, nullable=True)
    cycle_length = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    # Relationships
    pcos_checks = relationship("PCOSCheck", back_populates="user")
    cycle_entries = relationship("CycleEntry", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")

class PCOSCheck(Base):
    __tablename__ = "pcos_checks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    answers = Column(Text)  # Store as JSON string
    risk = Column(String)
    tips = Column(Text)  # Store as JSON string
    user = relationship("User", back_populates="pcos_checks") 

class CycleEntry(Base):
    __tablename__ = "cycle_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    notes = Column(Text)
    deleted = Column(Boolean, default=False)
    user = relationship("User", back_populates="cycle_entries")

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    mood = Column(String)
    text = Column(Text)
    analysis = Column(Text)
    deleted = Column(Boolean, default=False)
    user = relationship("User", back_populates="journal_entries")

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null for global recs
    type = Column(String)
    text = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="recommendations") 

# Example Pydantic model (add your own as needed)
class JournalEntryIn(BaseModel):
    date: datetime = None
    mood: str
    text: str
    analysis: str = None

    model_config = {
        "from_attributes": True
    }
class UserOut(BaseModel):
    id: int
    email: str
    full_name: str | None = None
    age: int | None = None
    weight: int | None = None
    cycle_length: int | None = None
    bio: str | None = None

    model_config = {
        "from_attributes": True
    }