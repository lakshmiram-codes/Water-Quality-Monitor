from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.report import ReportStatus


class ReportCreate(BaseModel):
    location: str
    description: str
    water_source: str
    station_id: Optional[int] = None


class ReportUpdateStatus(BaseModel):
    status: ReportStatus


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    station_id: Optional[int] = None
    photo_url: Optional[str] = None
    location: str
    description: str
    water_source: str
    status: ReportStatus
    created_at: datetime
