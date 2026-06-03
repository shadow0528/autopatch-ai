from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class RebootRequestBase(BaseModel):
    target: str
    reboot_type: str
    scheduled_for: Optional[datetime] = None

class RebootRequestCreate(RebootRequestBase):
    pass

class RebootRequestUpdate(BaseModel):
    status: Optional[str] = None
    agent_reconnect_validated: Optional[str] = None
    patch_validated: Optional[str] = None
    vulnerability_validated: Optional[str] = None
    service_health_validated: Optional[str] = None

class RebootRequestInDBBase(RebootRequestBase):
    id: int
    status: str
    requested_at: datetime
    scheduled_for: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    agent_reconnect_validated: str
    patch_validated: str
    vulnerability_validated: str
    service_health_validated: str

    model_config = ConfigDict(from_attributes=True)

class RebootRequest(RebootRequestInDBBase):
    pass
