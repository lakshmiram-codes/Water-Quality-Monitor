from sqlalchemy.orm import Session

from app.models.alert import Alert, AlertType
from app.models.station_reading import StationReading, Parameter
from app.models.report import Report

SAFE_RANGES = {
    Parameter.pH: (6.5, 8.5),
    Parameter.turbidity: (0.0, 5.0),
    Parameter.DO: (5.0, 14.0),
    Parameter.lead: (0.0, 0.015),
    Parameter.arsenic: (0.0, 0.010),
}

CONTAMINATION_KEYWORDS = [
    "smell", "odor", "discolor", "brown water", "sewage", "chemical spill",
    "oil sheen", "dead fish", "algae bloom", "foam",
]
BOIL_KEYWORDS = ["boil", "no water pressure", "main break", "e. coli", "ecoli", "bacteria"]


def evaluate_reading(db: Session, reading: StationReading) -> Alert | None:
    low, high = SAFE_RANGES.get(reading.parameter, (None, None))
    if low is None:
        return None

    value = float(reading.value)
    if value < low or value > high:
        alert = Alert(
            alert_type=AlertType.contamination,
            message=(
                f"{reading.parameter.value} reading of {value} is outside the safe "
                f"range ({low}-{high}) at station #{reading.station_id}."
            ),
            location=reading.station.location if reading.station else "unknown",
            station_id=reading.station_id,
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert
    return None


def evaluate_report(db: Session, report: Report) -> Alert | None:
    text = f"{report.description} {report.water_source}".lower()

    alert_type = None
    if any(k in text for k in BOIL_KEYWORDS):
        alert_type = AlertType.boil_notice
    elif any(k in text for k in CONTAMINATION_KEYWORDS):
        alert_type = AlertType.contamination

    if alert_type is None:
        return None

    alert = Alert(
        alert_type=alert_type,
        message=f"Citizen report flagged a possible {alert_type.value.replace('_', ' ')} at {report.location}.",
        location=report.location,
        station_id=report.station_id,
        report_id=report.id,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
