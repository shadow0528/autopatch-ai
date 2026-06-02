from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.models import patch as models
from app.schemas import patch as schemas
from app.core.security import get_api_key

router = APIRouter()

@router.post("/", response_model=schemas.PatchTask)
def create_patch_task(
    *,
    db: Session = Depends(get_db),
    task_in: schemas.PatchTaskCreate,
) -> Any:
    """Create a new patch deployment task."""
    task = models.PatchTask(
        target_host=task_in.target_host,
        patch_type=task_in.patch_type,
        payload=task_in.payload,
        status="Pending"
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

from fastapi import Query

@router.get("/", response_model=List[schemas.PatchTask])
def read_patch_tasks(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Retrieve all patch tasks with pagination."""
    return db.query(models.PatchTask).order_by(models.PatchTask.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/agent/{hostname}", response_model=List[schemas.PatchTask])
def get_pending_tasks_for_agent(
    hostname: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key),
) -> Any:
    """Agent polling endpoint to get its pending tasks."""
    tasks = db.query(models.PatchTask).filter(
        models.PatchTask.target_host == hostname,
        models.PatchTask.status == "Pending"
    ).all()
    return tasks

@router.put("/{task_id}", response_model=schemas.PatchTask)
def update_task_status(
    *,
    db: Session = Depends(get_db),
    task_id: int,
    task_in: schemas.PatchTaskUpdate,
    api_key: str = Depends(get_api_key),
) -> Any:
    """Agent endpoint to report task status updates."""
    task = db.query(models.PatchTask).filter(models.PatchTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task.status = task_in.status
    if task_in.output_log:
        task.output_log = task_in.output_log
    if task_in.execution_history:
        task.execution_history = task_in.execution_history
    if task_in.telemetry_data:
        task.telemetry_data = task_in.telemetry_data
    task.updated_at = datetime.utcnow()
    
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
