from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.alert import AlertType


class AlertCreate(BaseModel):
    alert_type: AlertType
    message: str
    location: str
    station_id: Optional[int] = None
    report_id: Optional[int] = None


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    alert_type: AlertType
    message: str
    location: str
    station_id: Optional[int] = None
    report_id: Optional[int] = None
    issued_at: datetime
