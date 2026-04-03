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

try:
    from .routes import auth, voice_agent
except ImportError:
    from routes import auth, voice_agent


@app.get("/")
def read_root():
    return {"message": "Welcome to SheCare-AI Backend!"}

# Include routers
app.include_router(auth.router)
# Voice agent routes
app.include_router(voice_agent.router, prefix="/voice", tags=["voice"]) 

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[int] = None
    cycle_length: Optional[int] = None
    bio: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[int] = None
    cycle_length: Optional[int] = None
    bio: Optional[str] = None
    class Config:
        orm_mode = True
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[int] = None
    cycle_length: Optional[int] = None
    bio: Optional[str] = None

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
    db_user = User(
        email=user.email, 
        hashed_password=hashed_pw, 
        full_name=user.full_name,
        age=user.age,
        weight=user.weight,
        cycle_length=user.cycle_length,
        bio=user.bio
    )
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
def dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch real data from database
    latest_cycle = db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).order_by(CycleEntry.start_date.desc()).first()
    latest_journal = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date.desc()).first()
    latest_pcos = db.query(PCOSCheck).filter(PCOSCheck.user_id == current_user.id).order_by(PCOSCheck.date.desc()).first()

    # Calculate cycle day number
    cycle_day = "-"
    if latest_cycle and latest_cycle.start_date:
        try:
            # Parse the start date
            start_date = latest_cycle.start_date
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date)
            
            # Calculate days since start
            today = datetime.utcnow()
            diff = (today - start_date).days
            cycle_day = str(diff + 1) if diff >= 0 else "-"
        except Exception as e:
            print(f"Error calculating cycle day: {e}")
            cycle_day = "-"

    return {
        "id": current_user.id,
        "name": current_user.full_name or current_user.email.split("@")[0],
        "cycle_day": latest_cycle.start_date.strftime("%Y-%m-%d") if latest_cycle and latest_cycle.start_date else None,
        "cycleDay": cycle_day,
        "mood": latest_journal.mood if latest_journal and latest_journal.mood else "-",
        "pcos_risk": latest_pcos.risk if latest_pcos and latest_pcos.risk else None,
        "pcosRisk": latest_pcos.risk if latest_pcos and latest_pcos.risk else "-"
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
        orm_mode = True
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

@app.delete("/pcos-checker/{pcos_id}")
def delete_pcos_check(
    pcos_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(PCOSCheck).filter(
        PCOSCheck.id == pcos_id,
        PCOSCheck.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="PCOS check not found.")
    db.delete(entry)
    db.commit()
    return {"message": "PCOS check deleted."}

# --- Cycle Tracker ---
class CycleEntryIn(BaseModel):
    start_date: str  # Accept date string like "2024-01-15"
    end_date: Optional[str] = None
    notes: Optional[str] = None

class CycleEntryOut(BaseModel):
    id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None
    class Config:
        orm_mode = True
        from_attributes = True

@app.post("/cycle-tracker", response_model=CycleEntryOut)
def add_cycle_entry(
    entry: CycleEntryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Convert date strings to datetime objects
    start_date = datetime.fromisoformat(entry.start_date)
    end_date = datetime.fromisoformat(entry.end_date) if entry.end_date else None
    
    db_entry = CycleEntry(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
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

@app.delete("/cycle-tracker/{entry_id}")
def delete_cycle_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(CycleEntry).filter(
        CycleEntry.id == entry_id,
        CycleEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Cycle entry not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Cycle entry deleted."}

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
        orm_mode = True
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

@app.delete("/journal/{journal_id}")
def delete_journal_entry(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == journal_id,
        JournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted."}

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
        orm_mode = True
        from_attributes = True


def build_default_recommendations(current_time: datetime):
    return [
        RecommendationOut(
            id=3001,
            type="general",
            text="Drink water regularly and keep a bottle nearby so hydration stays easy.",
            date=current_time,
        ),
        RecommendationOut(
            id=3002,
            type="wellness",
            text="Take a 10-minute walk or stretch break to reduce tension and refresh your focus.",
            date=current_time,
        ),
        RecommendationOut(
            id=3003,
            type="nutrition",
            text="Build meals around protein, fiber, and healthy fats to support steadier energy.",
            date=current_time,
        ),
        RecommendationOut(
            id=3004,
            type="mood",
            text="If your mood feels heavy, try a short journal entry or message someone you trust.",
            date=current_time,
        ),
        RecommendationOut(
            id=3005,
            type="cycle",
            text="Track your cycle, symptoms, and flow regularly to spot patterns earlier.",
            date=current_time,
        ),
        RecommendationOut(
            id=3006,
            type="wellness",
            text="Aim for consistent sleep tonight, since rest can help with energy and cycle comfort.",
            date=current_time,
        ),
        RecommendationOut(
            id=3007,
            type="pcos",
            text="If you notice irregular cycles, acne, or persistent symptoms, consider discussing them with a clinician.",
            date=current_time,
        ),
        RecommendationOut(
            id=3008,
            type="general",
            text="Use the journal and profile tools to keep your recommendations more personalized over time.",
            date=current_time,
        ),
    ]

@app.get("/recommendations/public")
def get_public_recommendations():
    """Public recommendations that don't require authentication"""
    current_time = datetime.utcnow()
    return [
        {
            "id": recommendation.id,
            "type": recommendation.type,
            "text": recommendation.text,
            "date": recommendation.date.isoformat(),
        }
        for recommendation in build_default_recommendations(current_time)
    ]

@app.get("/recommendations", response_model=List[RecommendationOut])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recs = []
    existing_keys = set()

    def add_recommendation(recommendation: RecommendationOut):
        key = (recommendation.type.lower(), recommendation.text.strip().lower())
        if key in existing_keys:
            return
        recs.append(recommendation)
        existing_keys.add(key)

    # 1. Cycle Tracker Data
    latest_cycle = db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).order_by(CycleEntry.start_date.desc()).first()
    if latest_cycle:
        add_recommendation(RecommendationOut(
            id=1001,
            type="cycle",
            text="Your period started on {}. Remember to track your symptoms!".format(latest_cycle.start_date.strftime("%b %d")),
            date=latest_cycle.start_date,
        ))

    # 2. Journal Data
    latest_journal = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date.desc()).first()
    if latest_journal and "sad" in latest_journal.mood.lower():
        add_recommendation(RecommendationOut(
            id=1002,
            type="mood",
            text="We noticed a low mood entry. Try some self-care or journaling today! 😊",
            date=latest_journal.date,
        ))

    # 3. PCOS Checker Data
    latest_pcos = db.query(PCOSCheck).filter(PCOSCheck.user_id == current_user.id).order_by(PCOSCheck.date.desc()).first()
    if latest_pcos and latest_pcos.risk == "High":
        add_recommendation(RecommendationOut(
            id=1003,
            type="pcos",
            text="Your recent PCOS check suggests high risk. Consider consulting a specialist. 🩺",
            date=latest_pcos.date,
        ))

    # Add global recommendations from database
    global_recs = db.query(Recommendation).filter(Recommendation.user_id == None).all()
    for i, global_rec in enumerate(global_recs):
        add_recommendation(RecommendationOut(
            id=2000 + i,
            type=global_rec.type,
            text=global_rec.text,
            date=global_rec.date,
        ))

    # Keep the feed useful even when the user has only a small amount of data.
    if len(recs) < 5:
        current_time = datetime.utcnow()
        for default_rec in build_default_recommendations(current_time):
            if len(recs) >= 5:
                break
            add_recommendation(default_rec)

    return recs

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
    # Update fields if they are provided
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
    if update.age is not None:
        current_user.age = update.age
    if update.weight is not None:
        current_user.weight = update.weight
    if update.cycle_length is not None:
        current_user.cycle_length = update.cycle_length
    if update.bio is not None:
        current_user.bio = update.bio
    
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