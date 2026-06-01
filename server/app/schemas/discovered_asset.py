from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DiscoveredAssetBase(BaseModel):
    ip_address: str
    hostname: Optional[str] = None
    subnet: Optional[str] = None
    discovered_by: str

class DiscoveredAssetCreate(DiscoveredAssetBase):
    pass

class DiscoveredAssetInDBBase(DiscoveredAssetBase):
    id: int
    last_seen: datetime
    is_managed: bool

    model_config = ConfigDict(from_attributes=True)

class DiscoveredAsset(DiscoveredAssetInDBBase):
    pass
