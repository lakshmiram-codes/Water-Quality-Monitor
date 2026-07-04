from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.models.water_station import WaterStation
from app.schemas.water_station import WaterStationCreate, WaterStationOut
from app.services.external_apis import fetch_readings_for_station

router = APIRouter(prefix="/api/stations", tags=["stations"])


@router.get("", response_model=list[WaterStationOut])
def list_stations(db: Session = Depends(get_db)):
    return db.query(WaterStation).order_by(WaterStation.name).all()


@router.get("/{station_id}", response_model=WaterStationOut)
def get_station(station_id: int, db: Session = Depends(get_db)):
    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station


@router.post("", response_model=WaterStationOut, status_code=201)
def create_station(
    payload: WaterStationCreate,
    db: Session = Depends(get_db),
    _mod: User = Depends(require_roles("authority", "admin")),
):
    station = WaterStation(**payload.model_dump())
    db.add(station)
    db.commit()
    db.refresh(station)
    return station


@router.post("/{station_id}/sync", status_code=202)
def sync_station_readings(
    station_id: int,
    db: Session = Depends(get_db),
    _mod: User = Depends(require_roles("authority", "admin")),
):
    from app.models.station_reading import StationReading

    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    raw_readings = fetch_readings_for_station(station)
    created = []
    for r in raw_readings:
        reading = StationReading(station_id=station.id, parameter=r["parameter"], value=r["value"])
        db.add(reading)
        created.append(reading)
    db.commit()

    from app.services.alert_engine import evaluate_reading

    for reading in created:
        db.refresh(reading)
        evaluate_reading(db, reading)

    return {"synced": len(created)}
