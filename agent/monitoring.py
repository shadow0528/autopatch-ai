import psutil
import time
import requests
import logging

logger = logging.getLogger("AutoPatchAgent.Monitoring")

def check_for_anomalies(hostname: str, server_url: str):
    """
    Monitors system resource utilization and reports potential threats 
    such as cryptominers or memory leaks based on sudden resource spikes.
    """
    cpu_percent = psutil.cpu_percent(interval=2)
    mem_percent = psutil.virtual_memory().percent
    
    # Simple static threshold evaluation for MVP
    anomalies_found = False
    payload = {
        "hostname": hostname,
        "alert_type": "",
        "severity": "",
        "description": ""
    }
    
    if cpu_percent > 95:
        anomalies_found = True
        payload["alert_type"] = "CPU Spike"
        payload["severity"] = "High"
        payload["description"] = f"Abnormal sustained CPU utilization detected: {cpu_percent}%"
        
    elif mem_percent > 95:
        anomalies_found = True
        payload["alert_type"] = "Memory Spike"
        payload["severity"] = "Medium"
        payload["description"] = f"Abnormal sustained Memory utilization detected: {mem_percent}%"
        
    if anomalies_found:
        url = f"{server_url}/api/v1/threats/"
        try:
            res = requests.post(url, json=payload, timeout=5)
            if res.status_code == 200:
                logger.warning(f"Reported threat anomaly: {payload['alert_type']}")
        except Exception as e:
            logger.error(f"Failed to report threat anomaly: {e}")
