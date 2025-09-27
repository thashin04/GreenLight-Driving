from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import  List, Optional

class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class IncidentStatus(str, Enum):
    OPEN = "open"
    ARCHIVED = "archived"

class IncidentUpdate(BaseModel):
    incident_details: Optional[str] = None
    status: Optional[IncidentStatus] = None

class IncidentQuizSubmission(BaseModel):
    selected_answer_index: int

class IncidentQuiz(BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str
    user_selected_index: Optional[int] = None
    is_correct: Optional[bool] = None

class Incident(BaseModel):
    incident_id: str
    user_id: str
    status: IncidentStatus = IncidentStatus.OPEN
    created_at: datetime
    
    incident_summary: str
    severity: SeverityLevel
    video_url: str
    
    quiz: IncidentQuiz
    simulation_html: str
    simulation_better_html: str

    class Config:
        from_attributes = True