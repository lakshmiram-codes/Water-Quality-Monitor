from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class WaterStation(Base):
    __tablename__ = "water_stations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    managed_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    readings = relationship("StationReading", back_populates="station", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="station")
    alerts = relationship("Alert", back_populates="station")
    collaborations = relationship("Collaboration", back_populates="station")
