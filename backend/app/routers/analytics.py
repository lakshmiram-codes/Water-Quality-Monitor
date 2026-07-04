from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.station_reading import StationReading, Parameter
from app.models.water_station import WaterStation
from app.schemas.analytics import TrendResponse, TrendPoint, PredictionResult
from app.services.predictive import predict_contamination_risk

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/trends/{station_id}/{parameter}", response_model=TrendResponse)
def get_trend(station_id: int, parameter: Parameter, limit: int = 50, db: Session = Depends(get_db)):
    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    readings = (
        db.query(StationReading)
        .filter(StationReading.station_id == station_id, StationReading.parameter == parameter)
        .order_by(StationReading.recorded_at.desc())
        .limit(limit)
        .all()
    )
    readings = list(reversed(readings))

    return TrendResponse(
        station_id=station_id,
        parameter=parameter,
        points=[TrendPoint(recorded_at=r.recorded_at.isoformat(), value=float(r.value)) for r in readings],
    )


@router.get("/predict/{station_id}/{parameter}", response_model=PredictionResult)
def get_prediction(station_id: int, parameter: Parameter, db: Session = Depends(get_db)):
    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    result = predict_contamination_risk(db, station_id, parameter)
    return PredictionResult(**result.__dict__)
