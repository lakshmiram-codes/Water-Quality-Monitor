from typing import Optional

from pydantic import BaseModel

from app.models.station_reading import Parameter


class TrendPoint(BaseModel):
    recorded_at: str
    value: float


class TrendResponse(BaseModel):
    station_id: int
    parameter: Parameter
    points: list[TrendPoint]


class PredictionResult(BaseModel):
    station_id: int
    parameter: Parameter
    risk_level: str
    risk_score: float
    reason: str
    latest_value: Optional[float] = None
    baseline_mean: Optional[float] = None
