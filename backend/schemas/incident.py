from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class IncidentStatus(str, Enum):
    OPEN = "open"
    ARCHIVED = "archived"

class IncidentQuiz(BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str
    user_selected_index: Optional[int] = None
    is_correct: Optional[bool] = None

class IncidentCreate(BaseModel):
    incident_summary: str
    severity: SeverityLevel
    video_url: str
    quiz: IncidentQuiz
    simulation_html: str
    simulation_better_html: str

class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None

class IncidentQuizSubmission(BaseModel):
    selected_answer_index: int

class Incident(BaseModel):
    incident_id: UUID = Field(default_factory=uuid4)
    user_id: str
    status: IncidentStatus = IncidentStatus.OPEN
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    incident_summary: str
    severity: SeverityLevel
    video_url: str
    
    quiz: IncidentQuiz
    simulation_html: str
    simulation_better_html: str

    class Config:
        from_attributes = True