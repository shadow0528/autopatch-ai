from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Shared properties
class AgentBase(BaseModel):
    hostname: str
    ip_address: str
    cpu_utilization: Optional[float] = 0.0
    memory_utilization: Optional[float] = 0.0
    os_version: Optional[str] = None
    subnet: Optional[str] = None
    agent_version: str

# Properties to receive via API on creation or heartbeat
class AgentCreate(AgentBase):
    pass

# Properties to receive via API on heartbeat update
class AgentUpdate(AgentBase):
    pass

from pydantic import ConfigDict

class AgentInDBBase(AgentBase):
    id: int
    last_seen: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)

# Additional properties to return via API
class Agent(AgentInDBBase):
    pass
