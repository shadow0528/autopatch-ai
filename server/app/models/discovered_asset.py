from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.db.session import Base

class DiscoveredAsset(Base):
    __tablename__ = "discovered_assets"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, index=True)
    hostname = Column(String, nullable=True)
    subnet = Column(String, nullable=True)
    discovered_by = Column(String)  # Agent hostname that discovered this
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_managed = Column(Boolean, default=False)  # True if agent is installed
