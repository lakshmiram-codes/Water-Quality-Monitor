from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.collaboration import Collaboration
from app.models.user import User
from app.schemas.collaboration import CollaborationCreate, CollaborationOut

router = APIRouter(prefix="/api/collaborations", tags=["collaborations"])


@router.post("", response_model=CollaborationOut, status_code=201)
def create_collaboration(
    payload: CollaborationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ngo", "admin")),
):
    collab = Collaboration(ngo_id=current_user.id, **payload.model_dump())
    db.add(collab)
    db.commit()
    db.refresh(collab)
    return collab


@router.get("", response_model=list[CollaborationOut])
def list_collaborations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Collaboration)
    if current_user.role.value == "ngo":
        query = query.filter(Collaboration.ngo_id == current_user.id)
    return query.order_by(Collaboration.created_at.desc()).all()


@router.delete("/{collab_id}", status_code=204)
def delete_collaboration(
    collab_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ngo", "admin")),
):
    collab = db.query(Collaboration).filter(Collaboration.id == collab_id).first()
    if not collab:
        raise HTTPException(status_code=404, detail="Collaboration not found")
    if current_user.role.value == "ngo" and collab.ngo_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(collab)
    db.commit()
