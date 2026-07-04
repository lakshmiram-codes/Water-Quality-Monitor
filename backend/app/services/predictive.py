import statistics
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.station_reading import StationReading, Parameter


@dataclass
class PredictionResult:
    station_id: int
    parameter: Parameter
    risk_level: str
    risk_score: float
    reason: str
    latest_value: float | None
    baseline_mean: float | None


def predict_contamination_risk(db: Session, station_id: int, parameter: Parameter) -> PredictionResult:
    lookback = settings.PREDICTIVE_LOOKBACK_READINGS
    readings = (
        db.query(StationReading)
        .filter(StationReading.station_id == station_id, StationReading.parameter == parameter)
        .order_by(StationReading.recorded_at.desc())
        .limit(lookback)
        .all()
    )
    readings = list(reversed(readings))

    if len(readings) < 3:
        return PredictionResult(
            station_id=station_id,
            parameter=parameter,
            risk_level="low",
            risk_score=0.0,
            reason="Not enough historical readings yet to model risk (need at least 3).",
            latest_value=float(readings[-1].value) if readings else None,
            baseline_mean=None,
        )

    values = [float(r.value) for r in readings]
    baseline = values[:-1]
    latest = values[-1]

    mean = statistics.mean(baseline)
    stdev = statistics.pstdev(baseline) or 0.0001

    z_score = abs(latest - mean) / stdev

    n = len(values)
    x_mean = (n - 1) / 2
    y_mean = statistics.mean(values)
    numerator = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(values))
    denominator = sum((i - x_mean) ** 2 for i in range(n)) or 1
    slope = numerator / denominator
    normalized_slope = abs(slope) / (mean if mean else 1)

    risk_score = min(1.0, 0.7 * min(z_score / 3, 1.0) + 0.3 * min(normalized_slope * 5, 1.0))

    if risk_score >= 0.66:
        level = "high"
    elif risk_score >= 0.33:
        level = "medium"
    else:
        level = "low"

    reason = (
        f"Latest {parameter.value} reading is {z_score:.2f} standard deviations from the "
        f"{lookback}-reading baseline mean, with a recent trend slope of {slope:.4f} per reading."
    )

    return PredictionResult(
        station_id=station_id,
        parameter=parameter,
        risk_level=level,
        risk_score=round(risk_score, 3),
        reason=reason,
        latest_value=latest,
        baseline_mean=round(mean, 4),
    )
