from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict


class CollaborationCreate(BaseModel):
    project_name: str
    contact_email: EmailStr
    station_id: Optional[int] = None


class CollaborationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ngo_id: int
    project_name: str
    station_id: Optional[int] = None
    contact_email: EmailStr
    created_at: datetime
