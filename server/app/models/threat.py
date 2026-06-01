from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class ThreatAlert(Base):
    __tablename__ = "threat_alerts"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String, index=True)
    alert_type = Column(String) # 'CPU Spike', 'Memory Spike', 'Suspicious Process', 'Security Event'
    severity = Column(String) # 'Low', 'Medium', 'High', 'Critical'
    description = Column(String)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    forensic_artifacts = Column(String, nullable=True) # Optional JSON string dump of log artifacts
