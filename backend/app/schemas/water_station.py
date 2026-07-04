from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class WaterStationCreate(BaseModel):
    name: str
    location: str
    latitude: float
    longitude: float
    managed_by: Optional[str] = None


class WaterStationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    location: str
    latitude: float
    longitude: float
    managed_by: Optional[str] = None
    created_at: datetime
