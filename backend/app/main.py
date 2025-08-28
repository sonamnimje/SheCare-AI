from fastapi import FastAPI, HTTPException, Depends, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional

try:
    from .database import SessionLocal, engine, get_db
    from .models import Base, User, PCOSCheck, CycleEntry, JournalEntry, Recommendation
    from .config import settings
except ImportError:
    # Try absolute imports if relative imports fail
    from database import SessionLocal, engine, get_db
    from models import Base, User, PCOSCheck, CycleEntry, JournalEntry, Recommendation
    from config import settings

import json

app = FastAPI()

from routes import auth


@app.get("/")
def read_root():
    return {"message": "Welcome to SheCare-AI Backend!"}

# Include routers
app.include_router(auth.router)

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables if not exist
Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int = None

class UserUpdate(BaseModel):
    full_name: str = None
    email: EmailStr = None
    password: str = None

# Utility functions for JWT
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    user = get_user_by_id(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    return user

@app.post("/auth/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    hashed_pw = pwd_context.hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_pw, full_name=user.full_name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@app.post("/auth/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- User Dashboard ---
@app.get("/dashboard")
def dashboard(current_user: User = Depends(get_current_user)):
    # Example personalized data; expand as needed
    return {
        "id": current_user.id,
        "name": current_user.full_name or current_user.email.split("@")[0],
        "cycleDay": "-",  # Placeholder, replace with real data
        "mood": "-",      # Placeholder, replace with real data
        "pcosRisk": "-"   # Placeholder, replace with real data
    }

# --- PCOS Risk Checker ---
class PCOSCheckIn(BaseModel):
    answers: dict
    risk: str
    tips: List[str]

class PCOSCheckOut(BaseModel):
    id: int
    date: datetime
    answers: dict
    risk: str
    tips: List[str]
    class Config:
        from_attributes = True

TIPS = {
    "Low": [
        "Maintain a balanced diet and regular exercise.",
        "Continue tracking your cycle and symptoms.",
        "Schedule regular checkups with your doctor."
    ],
    "Moderate": [
        "Consider consulting a gynecologist for further evaluation.",
        "Adopt a healthy lifestyle: balanced diet, exercise, stress management.",
        "Monitor symptoms and menstrual cycle closely."
    ],
    "High": [
        "Consult a healthcare provider for a detailed diagnosis and management plan.",
        "Discuss possible treatments and lifestyle changes.",
        "Seek support for emotional well-being if needed."
    ]
}

@app.post("/pcos-checker", response_model=PCOSCheckOut)
def create_pcos_check(
    form: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    answers = form
    symptoms = answers.get("symptoms", [])
    # Rule-based risk logic
    if len(symptoms) > 3:
        risk = "High"
    elif len(symptoms) > 1:
        risk = "Moderate"
    else:
        risk = "Low"
    tips = TIPS[risk]
    db_check = PCOSCheck(
        user_id=current_user.id,
        answers=json.dumps(answers),
        risk=risk,
        tips=json.dumps(tips)
    )
    db.add(db_check)
    db.commit()
    db.refresh(db_check)
    return PCOSCheckOut(
        id=db_check.id,
        date=db_check.date,
        answers=json.loads(db_check.answers),
        risk=db_check.risk,
        tips=json.loads(db_check.tips)
    )

@app.get("/pcos-checker", response_model=List[PCOSCheckOut])
def get_pcos_checks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    checks = db.query(PCOSCheck).filter(PCOSCheck.user_id == current_user.id).order_by(PCOSCheck.date.desc()).all()
    return [
        PCOSCheckOut(
            id=chk.id,
            date=chk.date,
            answers=json.loads(chk.answers),
            risk=chk.risk,
            tips=json.loads(chk.tips)
        ) for chk in checks
    ]

# --- Cycle Tracker ---
class CycleEntryIn(BaseModel):
    start_date: datetime
    end_date: datetime = None
    notes: str = None

class CycleEntryOut(BaseModel):
    id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

@app.post("/cycle-tracker", response_model=CycleEntryOut)
def add_cycle_entry(
    entry: CycleEntryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_entry = CycleEntry(
        user_id=current_user.id,
        start_date=entry.start_date,
        end_date=entry.end_date,
        notes=entry.notes
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/cycle-tracker", response_model=List[CycleEntryOut])
def get_cycle_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).order_by(CycleEntry.start_date.desc()).all()
    return entries

# --- Journal ---
class JournalEntryIn(BaseModel):
    date: datetime = None
    mood: str
    text: str
    analysis: str = None

class JournalEntryOut(BaseModel):
    id: int
    date: datetime
    mood: str
    text: str
    analysis: Optional[str] = None
    class Config:
        from_attributes = True

@app.post("/journal", response_model=JournalEntryOut)
def add_journal_entry(
    entry: JournalEntryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_entry = JournalEntry(
        user_id=current_user.id,
        date=entry.date or datetime.utcnow(),
        mood=entry.mood,
        text=entry.text,
        analysis=entry.analysis
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/journal", response_model=List[JournalEntryOut])
def get_journal_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date.desc()).all()
    return entries

# --- Chatbot ---
@app.post("/chatbot")
def chatbot():
    # Placeholder for chatbot functionality
    return {"message": "Chatbot feature coming soon!"}

# --- Recommendations ---
class RecommendationOut(BaseModel):
    id: int
    type: str
    text: str
    date: datetime
    class Config:
        from_attributes = True

@app.get("/recommendations", response_model=List[RecommendationOut])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Return user-specific and global recommendations
    user_recs = db.query(Recommendation).filter(Recommendation.user_id == current_user.id).all()
    global_recs = db.query(Recommendation).filter(Recommendation.user_id == None).all()
    return user_recs + global_recs

# --- Admin Endpoints ---
@app.get("/admin/analytics")
def admin_analytics():
    # Placeholder for admin analytics
    return {"message": "Admin analytics coming soon!"}

@app.get("/admin/tips")
def admin_tips():
    # Placeholder for admin tips management
    return {"message": "Admin tips management coming soon!"}

@app.get("/admin/logs")
def admin_logs():
    # Placeholder for admin logs
    return {"message": "Admin logs coming soon!"}

# --- Profile Management ---
@app.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/profile", response_model=UserOut)
def update_profile(
    update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if update.full_name is not None:
        current_user.full_name = update.full_name
    if update.email is not None:
        # Check if email is already taken
        existing = db.query(User).filter(User.email == update.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered.")
        current_user.email = update.email
    if update.password is not None:
        current_user.hashed_password = pwd_context.hash(update.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@app.delete("/profile")
def delete_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Profile deleted successfully"}

# --- Forgot Password ---
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@app.post("/auth/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found.")
    # Here you would generate a reset token and send email
    # For now, just return a success message
    return {"message": "If this email exists, a password reset link will be sent."}