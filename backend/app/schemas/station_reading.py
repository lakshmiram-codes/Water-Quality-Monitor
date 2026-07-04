from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.station_reading import Parameter


class StationReadingCreate(BaseModel):
    station_id: int
    parameter: Parameter
    value: float


class StationReadingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    station_id: int
    parameter: Parameter
    value: float
    recorded_at: datetime
