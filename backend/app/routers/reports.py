import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.report import Report, ReportStatus
from app.models.user import User
from app.schemas.report import ReportOut, ReportUpdateStatus
from app.services.alert_engine import evaluate_report

router = APIRouter(prefix="/api/reports", tags=["reports"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("", response_model=ReportOut, status_code=201)
def create_report(
    location: str = Form(...),
    description: str = Form(...),
    water_source: str = Form(...),
    station_id: Optional[int] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo_url = None
    if photo is not None:
        if photo.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=400, detail="Unsupported image type")
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(photo.filename)[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(photo.file.read())
        photo_url = f"/uploads/{filename}"

    report = Report(
        user_id=current_user.id,
        station_id=station_id,
        photo_url=photo_url,
        location=location,
        description=description,
        water_source=water_source,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    evaluate_report(db, report)

    return report


@router.get("", response_model=list[ReportOut])
def list_reports(
    status_filter: Optional[ReportStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Report)
    if current_user.role.value == "citizen":
        query = query.filter(Report.user_id == current_user.id)
    if status_filter:
        query = query.filter(Report.status == status_filter)
    return query.order_by(Report.created_at.desc()).all()


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if current_user.role.value == "citizen" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this report")
    return report


@router.patch("/{report_id}/status", response_model=ReportOut)
def update_report_status(
    report_id: int,
    payload: ReportUpdateStatus,
    db: Session = Depends(get_db),
    _mod: User = Depends(require_roles("authority", "admin")),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = payload.status
    db.commit()
    db.refresh(report)
    return report
