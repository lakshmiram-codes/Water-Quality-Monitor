"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-07-04

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

user_role_enum = sa.Enum("citizen", "ngo", "authority", "admin", name="userrole")
report_status_enum = sa.Enum("pending", "verified", "rejected", name="reportstatus")
parameter_enum = sa.Enum("pH", "turbidity", "DO", "lead", "arsenic", name="parameter")
alert_type_enum = sa.Enum("boil_notice", "contamination", "outage", name="alerttype")


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("password", sa.String(255), nullable=False),
        sa.Column("role", user_role_enum, nullable=False, server_default="citizen"),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "water_stations",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=False),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=False),
        sa.Column("managed_by", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "reports",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("station_id", sa.Integer, sa.ForeignKey("water_stations.id"), nullable=True),
        sa.Column("photo_url", sa.String(500), nullable=True),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("water_source", sa.String(200), nullable=False),
        sa.Column("status", report_status_enum, nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "station_readings",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("station_id", sa.Integer, sa.ForeignKey("water_stations.id"), nullable=False),
        sa.Column("parameter", parameter_enum, nullable=False),
        sa.Column("value", sa.Numeric(10, 4), nullable=False),
        sa.Column("recorded_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("alert_type", alert_type_enum, nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("station_id", sa.Integer, sa.ForeignKey("water_stations.id"), nullable=True),
        sa.Column("report_id", sa.Integer, sa.ForeignKey("reports.id"), nullable=True),
        sa.Column("issued_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "collaborations",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("ngo_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("project_name", sa.String(255), nullable=False),
        sa.Column("station_id", sa.Integer, sa.ForeignKey("water_stations.id"), nullable=True),
        sa.Column("contact_email", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("collaborations")
    op.drop_table("alerts")
    op.drop_table("station_readings")
    op.drop_table("reports")
    op.drop_table("water_stations")
    op.drop_table("users")
    user_role_enum.drop(op.get_bind(), checkfirst=True)
    report_status_enum.drop(op.get_bind(), checkfirst=True)
    parameter_enum.drop(op.get_bind(), checkfirst=True)
    alert_type_enum.drop(op.get_bind(), checkfirst=True)
