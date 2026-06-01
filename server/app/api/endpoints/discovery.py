from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.models import discovered_asset as models
from app.models import agent as agent_models
from app.schemas import discovered_asset as schemas

router = APIRouter()

@router.post("/", response_model=schemas.DiscoveredAsset)
def report_discovered_asset(
    *,
    db: Session = Depends(get_db),
    asset_in: schemas.DiscoveredAssetCreate,
) -> Any:
    """
    Report a newly discovered asset or update last_seen for an existing one.
    """
    asset = db.query(models.DiscoveredAsset).filter(models.DiscoveredAsset.ip_address == asset_in.ip_address).first()
    
    # Check if this IP belongs to a managed agent
    managed_agent = db.query(agent_models.Agent).filter(agent_models.Agent.ip_address == asset_in.ip_address).first()
    is_managed = True if managed_agent else False

    if asset:
        # Update existing record
        if asset_in.hostname:
            asset.hostname = asset_in.hostname
        asset.subnet = asset_in.subnet
        asset.discovered_by = asset_in.discovered_by
        asset.last_seen = datetime.utcnow()
        asset.is_managed = is_managed
        
        db.add(asset)
        db.commit()
        db.refresh(asset)
        return asset
    
    # Create new record
    asset = models.DiscoveredAsset(
        ip_address=asset_in.ip_address,
        hostname=asset_in.hostname,
        subnet=asset_in.subnet,
        discovered_by=asset_in.discovered_by,
        is_managed=is_managed
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

@router.get("/", response_model=List[schemas.DiscoveredAsset])
def read_discovered_assets(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all discovered assets.
    """
    assets = db.query(models.DiscoveredAsset).offset(skip).limit(limit).all()
    return assets
