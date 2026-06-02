from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.models import reboot as models
from app.schemas import reboot as schemas
from app.core.security import get_api_key

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
        scheduled_for=request_in.scheduled_for,
        status="Pending Approval"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.put("/{req_id}", response_model=schemas.RebootRequest)
def update_reboot_status(
    *,
    db: Session = Depends(get_db),
    req_id: int,
    req_in: schemas.RebootRequestUpdate,
    api_key: str = Depends(get_api_key),
) -> Any:
    """Agent endpoint to report reboot status and post-reboot validation metrics."""
    req = db.query(models.RebootRequest).filter(models.RebootRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if req_in.status:
        req.status = req_in.status
        if req_in.status == "Completed":
            req.completed_at = datetime.utcnow()
            
    if req_in.agent_reconnect_validated:
        req.agent_reconnect_validated = req_in.agent_reconnect_validated
    if req_in.patch_validated:
        req.patch_validated = req_in.patch_validated
    if req_in.vulnerability_validated:
        req.vulnerability_validated = req_in.vulnerability_validated
    if req_in.service_health_validated:
        req.service_health_validated = req_in.service_health_validated
        
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

from fastapi import Query

@router.get("/", response_model=List[schemas.RebootRequest])
def read_reboot_requests(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Retrieve all reboot requests with pagination."""
    return db.query(models.RebootRequest).order_by(models.RebootRequest.requested_at.desc()).offset(skip).limit(limit).all()

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
        
    # Check concurrent executing reboots for Batch limit enforcement
    if req.reboot_type == "Batch":
        executing_count = db.query(models.RebootRequest).filter(models.RebootRequest.status == "Executing").count()
        if executing_count >= 10:
            raise HTTPException(status_code=429, detail="Batch reboot limit reached. Cannot approve more until current queue finishes.")
            
    req.status = "Approved"
    req.approved_at = datetime.utcnow()
    
    db.add(req)
    db.commit()
    db.refresh(req)
    return req
