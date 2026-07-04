from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.station_reading import StationReading, Parameter
from app.models.user import User
from app.schemas.station_reading import StationReadingCreate, StationReadingOut
from app.services.alert_engine import evaluate_reading

router = APIRouter(prefix="/api/readings", tags=["readings"])


@router.post("", response_model=StationReadingOut, status_code=201)
def create_reading(
    payload: StationReadingCreate,
    db: Session = Depends(get_db),
    _mod: User = Depends(require_roles("authority", "admin", "ngo")),
):
    reading = StationReading(**payload.model_dump())
    db.add(reading)
    db.commit()
    db.refresh(reading)
    evaluate_reading(db, reading)
    return reading


@router.get("", response_model=list[StationReadingOut])
def list_readings(
    station_id: int | None = None,
    parameter: Parameter | None = None,
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
):
    query = db.query(StationReading)
    if station_id:
        query = query.filter(StationReading.station_id == station_id)
    if parameter:
        query = query.filter(StationReading.parameter == parameter)
    return query.order_by(StationReading.recorded_at.desc()).limit(limit).all()
