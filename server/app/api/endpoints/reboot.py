from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.models import reboot as models
from app.schemas import reboot as schemas

router = APIRouter()

@router.post("/", response_model=schemas.RebootRequest)
def create_reboot_request(
    *,
    db: Session = Depends(get_db),
    request_in: schemas.RebootRequestCreate,
) -> Any:
    """Create a new reboot orchestration request requiring approval."""
    req = models.RebootRequest(
        target=request_in.target,
        reboot_type=request_in.reboot_type,
        status="Pending Approval"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/", response_model=List[schemas.RebootRequest])
def read_reboot_requests(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve all reboot requests."""
    return db.query(models.RebootRequest).offset(skip).limit(limit).all()

@router.put("/{req_id}/approve", response_model=schemas.RebootRequest)
def approve_reboot_request(
    *,
    db: Session = Depends(get_db),
    req_id: int,
) -> Any:
    """Approve a pending reboot request."""
    req = db.query(models.RebootRequest).filter(models.RebootRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req.status = "Approved"
    req.approved_at = datetime.utcnow()
    
    db.add(req)
    db.commit()
    db.refresh(req)
    return req
