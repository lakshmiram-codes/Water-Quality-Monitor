import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Parameter(str, enum.Enum):
    pH = "pH"
    turbidity = "turbidity"
    DO = "DO"
    lead = "lead"
    arsenic = "arsenic"


class StationReading(Base):
    __tablename__ = "station_readings"

    id: Mapped[int] = mapped_column(primary_key=True)
    station_id: Mapped[int] = mapped_column(ForeignKey("water_stations.id"), nullable=False)
    parameter: Mapped[Parameter] = mapped_column(Enum(Parameter), nullable=False)
    value: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    station = relationship("WaterStation", back_populates="readings")
