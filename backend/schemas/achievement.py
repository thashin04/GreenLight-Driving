from pydantic import BaseModel
from datetime import datetime

class AchievementCreate(BaseModel):
    achievement_name: str

class Achievement(BaseModel):
    id: str
    achievement_name: str
    achieved_at: datetime