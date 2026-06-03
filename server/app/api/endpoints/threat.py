from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import threat as models
from app.schemas import threat as schemas
from app.core.security import get_api_key
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
    api_key: str = Depends(get_api_key),
) -> Any:
    """Agent reports a new threat anomaly with compromise scoring correlation."""
    
    # Simulate a compromise score calculation and event timeline correlation
    # For MVP, we elevate severity dynamically and calculate a base risk score
    from datetime import datetime, timedelta
    
    recent_threats = db.query(models.ThreatAlert).filter(
        models.ThreatAlert.hostname == alert_in.hostname,
        models.ThreatAlert.detected_at >= datetime.utcnow() - timedelta(minutes=60)
    ).all()

    threat_count = len(recent_threats)
    compromise_score = min(100, (threat_count * 15) + (25 if alert_in.severity in ["High", "Critical"] else 10))
    
    final_severity = alert_in.severity
    if threat_count >= 2 and final_severity not in ["High", "Critical"]:
        final_severity = "High"
    if compromise_score > 80:
        final_severity = "Critical"
        logger.warning(f"CRITICAL COMPROMISE SCORE [{compromise_score}/100] reached for {alert_in.hostname}.")
        
    # Append the compromise score to the description as a correlated artifact for the dashboard
    final_description = f"{alert_in.description} | Associated Host Risk Score: {compromise_score}/100"
        
    alert = models.ThreatAlert(
        hostname=alert_in.hostname,
        alert_type=alert_in.alert_type,
        severity=final_severity,
        description=final_description,
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
