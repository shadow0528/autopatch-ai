from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PatchTaskBase(BaseModel):
    target_host: str
    patch_type: str
    payload: str

class PatchTaskCreate(PatchTaskBase):
    pass

class PatchTaskUpdate(BaseModel):
    status: str
    output_log: Optional[str] = None
    execution_history: Optional[str] = None

class PatchTaskInDBBase(PatchTaskBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    output_log: Optional[str] = None
    execution_history: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PatchTask(PatchTaskInDBBase):
    pass
