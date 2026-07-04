import random
from abc import ABC, abstractmethod
from datetime import datetime, timezone

import httpx

from app.core.config import settings
from app.models.station_reading import Parameter

PARAMETER_RANGES = {
    Parameter.pH: (6.0, 8.5),
    Parameter.turbidity: (0.5, 12.0),
    Parameter.DO: (4.0, 11.0),
    Parameter.lead: (0.0, 0.03),
    Parameter.arsenic: (0.0, 0.02),
}


class BaseWaterDataAdapter(ABC):
    name: str = "base"

    @abstractmethod
    def is_configured(self) -> bool:
        ...

    def fetch_readings(self, station) -> list[dict]:
        if self.is_configured():
            try:
                return self._fetch_live(station)
            except Exception:
                return self._fetch_mock(station)
        return self._fetch_mock(station)

    def _fetch_live(self, station) -> list[dict]:
        raise NotImplementedError

    def _fetch_mock(self, station) -> list[dict]:
        now = datetime.now(timezone.utc).isoformat()
        readings = []
        for param, (low, high) in PARAMETER_RANGES.items():
            value = round(random.uniform(low, high), 4)
            readings.append({"parameter": param.value, "value": value, "recorded_at": now})
        return readings


class EPAAdapter(BaseWaterDataAdapter):
    name = "us_epa"

    def is_configured(self) -> bool:
        return bool(settings.EPA_API_KEY)

    def _fetch_live(self, station) -> list[dict]:
        url = f"{settings.EPA_API_BASE_URL}/data/Result/search"
        params = {"mimeType": "json", "bBox": station.location}
        with httpx.Client(timeout=10) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()


class WHOAdapter(BaseWaterDataAdapter):
    name = "who"

    def is_configured(self) -> bool:
        return bool(settings.WHO_API_BASE_URL)

    def _fetch_live(self, station) -> list[dict]:
        with httpx.Client(timeout=10) as client:
            resp = client.get(f"{settings.WHO_API_BASE_URL}/stations/{station.id}/readings")
            resp.raise_for_status()
            return resp.json()


class CPCBAdapter(BaseWaterDataAdapter):
    name = "cpcb_india"

    def is_configured(self) -> bool:
        return bool(settings.CPCB_API_KEY and settings.CPCB_API_BASE_URL)

    def _fetch_live(self, station) -> list[dict]:
        headers = {"Authorization": f"Bearer {settings.CPCB_API_KEY}"}
        with httpx.Client(timeout=10) as client:
            resp = client.get(
                f"{settings.CPCB_API_BASE_URL}/stations/{station.id}/readings",
                headers=headers,
            )
            resp.raise_for_status()
            return resp.json()


ADAPTERS: list[BaseWaterDataAdapter] = [EPAAdapter(), WHOAdapter(), CPCBAdapter()]


def fetch_readings_for_station(station) -> list[dict]:
    for adapter in ADAPTERS:
        readings = adapter.fetch_readings(station)
        if readings:
            return readings
    return []
