from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import threat as models
from app.schemas import threat as schemas
import logging

logger = logging.getLogger("AutoPatchAPI.Threats")

router = APIRouter()

def send_email_alert(alert):
    """Mocks an email alert transmission for high/critical threats."""
    logger.warning(f"--- EMAIL ALERT DISPATCHED ---")
    logger.warning(f"To: is-security-team@company.local")
    logger.warning(f"Subject: [AutoPatch Security] {alert.severity} Alert on {alert.hostname}")
    logger.warning(f"Body: A {alert.alert_type} anomaly was detected. {alert.description}")
    logger.warning(f"------------------------------")

@router.post("/", response_model=schemas.ThreatAlert)
def report_threat_alert(
    *,
    db: Session = Depends(get_db),
    alert_in: schemas.ThreatAlertCreate,
) -> Any:
    """Agent reports a new threat anomaly with compromise scoring correlation."""
    
    # Simulate a compromise score calculation by checking consecutive recent threats
    # For MVP, we elevate severity dynamically if there are multiple alerts for this host
    from datetime import datetime, timedelta
    
    recent_threats = db.query(models.ThreatAlert).filter(
        models.ThreatAlert.hostname == alert_in.hostname,
        models.ThreatAlert.detected_at >= datetime.utcnow() - timedelta(minutes=5)
    ).count()

    final_severity = alert_in.severity
    if recent_threats >= 2 and final_severity not in ["High", "Critical"]:
        final_severity = "High"
        logger.warning(f"Elevated threat severity for {alert_in.hostname} due to consecutive alerts.")
        
    alert = models.ThreatAlert(
        hostname=alert_in.hostname,
        alert_type=alert_in.alert_type,
        severity=final_severity,
        description=alert_in.description,
        forensic_artifacts=alert_in.forensic_artifacts
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    # In a full deployment, trigger email notification here based on severity
    if alert.severity in ["High", "Critical"]:
        send_email_alert(alert)
        
    return alert

@router.get("/", response_model=List[schemas.ThreatAlert])
def read_threat_alerts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve all threat alerts."""
    return db.query(models.ThreatAlert).order_by(models.ThreatAlert.detected_at.desc()).offset(skip).limit(limit).all()
