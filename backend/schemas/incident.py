from pydantic import BaseModel, Field
from datetime import datetime, timezone
from uuid import UUID, uuid4
from enum import Enum
from typing import Optional

class IncidentStatus(str, Enum):
    OPEN = "open"
    ARCHIVED = "archived"

class IncidentBase(BaseModel):
    incident_details: str

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    incident_details: Optional[str] = None
    status: Optional[IncidentStatus] = None

class Incident(IncidentBase):
    incident_id: UUID = Field(default_factory=uuid4)
    user_id: str
    status: IncidentStatus = IncidentStatus.OPEN
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True