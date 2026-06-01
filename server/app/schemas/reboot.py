from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class RebootRequestBase(BaseModel):
    target: str
    reboot_type: str

class RebootRequestCreate(RebootRequestBase):
    pass

class RebootRequestInDBBase(RebootRequestBase):
    id: int
    status: str
    requested_at: datetime
    approved_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class RebootRequest(RebootRequestInDBBase):
    pass
