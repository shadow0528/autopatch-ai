from pydantic import BaseModel, ConfigDict
from datetime import datetime

from typing import Optional

class ThreatAlertBase(BaseModel):
    hostname: str
    alert_type: str
    severity: str
    description: str
    forensic_artifacts: Optional[str] = None

class ThreatAlertCreate(ThreatAlertBase):
    pass

class ThreatAlertInDBBase(ThreatAlertBase):
    id: int
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ThreatAlert(ThreatAlertInDBBase):
    pass
