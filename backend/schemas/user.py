import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    first_name: str
    safety_score: int
    daily_quiz_streak: int = 0
    last_daily_quiz: Optional[datetime.datetime] = None
    resolved_incidents: int

class SafetyScoreUpdate(BaseModel):
    safety_score: int

class QuizStreakUpdate(BaseModel):
    daily_quiz_streak: int

class ResolvedIncidentsUpdate(BaseModel):
    resolved_incidents: int