"""
Populate the database with demo-ready sample data:
a few users of each role, water stations with real-ish coordinates,
station readings (including one intentionally unsafe value so the
alert engine and predictive model have something to react to),
a citizen report, and an alert.

Run with:  python seed.py
(Run this AFTER `alembic upgrade head` has created the tables.)
"""
import random
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.water_station import WaterStation
from app.models.station_reading import StationReading, Parameter
from app.models.report import Report, ReportStatus
from app.models.alert import Alert, AlertType
from app.models.collaboration import Collaboration


def run():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already has data — skipping seed. Delete rows or the DB to reseed.")
            return

        users = [
            User(name="Ava Citizen", email="citizen@example.com", password=hash_password("password123"),
                 role=UserRole.citizen, location="Springfield, IL"),
            User(name="Nia NGO", email="ngo@example.com", password=hash_password("password123"),
                 role=UserRole.ngo, location="Springfield, IL"),
            User(name="Omar Authority", email="authority@example.com", password=hash_password("password123"),
                 role=UserRole.authority, location="Springfield, IL"),
            User(name="Site Admin", email="admin@example.com", password=hash_password("password123"),
                 role=UserRole.admin, location="HQ"),
        ]
        db.add_all(users)
        db.commit()
        for u in users:
            db.refresh(u)
        citizen, ngo, authority, admin = users

        stations = [
            WaterStation(name="Riverside Intake", location="Springfield River, IL",
                         latitude=39.7817, longitude=-89.6501, managed_by="Springfield Water Dept"),
            WaterStation(name="North Reservoir", location="North Springfield, IL",
                         latitude=39.8300, longitude=-89.6600, managed_by="Springfield Water Dept"),
            WaterStation(name="East Well Field", location="East Springfield, IL",
                         latitude=39.7900, longitude=-89.5900, managed_by="County Utilities"),
        ]
        db.add_all(stations)
        db.commit()
        for s in stations:
            db.refresh(s)

        # Historical readings: 12 points per parameter per station, mostly in-range
        now = datetime.now(timezone.utc)
        for station in stations:
            for param, (low, high) in {
                Parameter.pH: (6.8, 7.8),
                Parameter.turbidity: (1.0, 4.0),
                Parameter.DO: (7.0, 10.0),
                Parameter.lead: (0.001, 0.008),
                Parameter.arsenic: (0.001, 0.006),
            }.items():
                for i in range(12):
                    value = round(random.uniform(low, high), 4)
                    db.add(StationReading(
                        station_id=station.id, parameter=param, value=value,
                        recorded_at=now - timedelta(hours=(12 - i) * 4),
                    ))
        db.commit()

        # Intentionally unsafe latest reading at Riverside Intake -> should trigger an alert
        unsafe_reading = StationReading(
            station_id=stations[0].id, parameter=Parameter.lead, value=0.032, recorded_at=now,
        )
        db.add(unsafe_reading)
        db.commit()
        db.refresh(unsafe_reading)

        from app.services.alert_engine import evaluate_reading
        evaluate_reading(db, unsafe_reading)

        # A sample citizen report
        report = Report(
            user_id=citizen.id, station_id=stations[1].id,
            location="North Springfield, IL", description="Water has a strange chemical smell near the reservoir.",
            water_source="North Reservoir", status=ReportStatus.pending,
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        from app.services.alert_engine import evaluate_report
        evaluate_report(db, report)

        # A manually issued alert
        db.add(Alert(
            alert_type=AlertType.boil_notice,
            message="Boil water advisory issued for East Springfield due to a main break.",
            location="East Springfield, IL", station_id=stations[2].id,
        ))

        # NGO collaboration
        db.add(Collaboration(
            ngo_id=ngo.id, project_name="Clean Springfield River Initiative",
            station_id=stations[0].id, contact_email="ngo@example.com",
        ))
        db.commit()

        print("Seed data created successfully.")
        print("Demo logins (password: password123):")
        for u in users:
            print(f"  {u.role.value:10s} -> {u.email}")

    finally:
        db.close()


if __name__ == "__main__":
    run()
