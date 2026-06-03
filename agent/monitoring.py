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
    
    import json
    
    # Simple static threshold evaluation for MVP
    anomalies_found = False
    payload = {
        "hostname": hostname,
        "alert_type": "",
        "severity": "",
        "description": "",
        "forensic_artifacts": None
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
        
    # Check for unauthorized processes running (simulated security check)
    unauthorized_procs = ["mimikatz", "psexec", "bloodhound", "nc.exe"]
    for proc in psutil.process_iter(['name']):
        try:
            if proc.info['name'] and any(bad_name in proc.info['name'].lower() for bad_name in unauthorized_procs):
                anomalies_found = True
                payload["alert_type"] = "Suspicious Process"
                payload["severity"] = "Critical"
                payload["description"] = f"Unauthorized process detected running in memory: {proc.info['name']}"
                break
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

    # Simulated Event Viewer Log Audit and Forensic Correlation
    # In reality this uses `Get-WinEvent -LogName Security -InstanceId 4625, 7045` via subprocess
    import random
    if random.randint(1, 100) > 90: # 10% chance of triggering a mock event log detection
        anomalies_found = True
        
        # Randomly choose between a failed logon spike or a suspicious service installation
        if random.choice([True, False]):
            payload["alert_type"] = "Security Event - Failed Logons"
            payload["severity"] = "Medium"
            payload["description"] = "Brute force behavior: Consecutive failed logons (Event ID 4625) threshold exceeded."
            payload["forensic_artifacts"] = json.dumps([
                {"EventID": 4625, "Time": time.time(), "Message": "An account failed to log on", "TargetUser": "Administrator", "SourceIP": "10.0.0.45"},
                {"EventID": 4625, "Time": time.time() + 1.2, "Message": "An account failed to log on", "TargetUser": "Administrator", "SourceIP": "10.0.0.45"},
                {"EventID": 4625, "Time": time.time() + 2.5, "Message": "An account failed to log on", "TargetUser": "Administrator", "SourceIP": "10.0.0.45"}
            ])
        else:
            payload["alert_type"] = "Suspicious Service Installation"
            payload["severity"] = "High"
            payload["description"] = "A new service was installed in the system matching known persistence vectors (Event ID 7045)."
            payload["forensic_artifacts"] = json.dumps([
                {"EventID": 7045, "Time": time.time(), "Message": "A service was installed in the system.", "ServiceName": "WmiApSrv_malicious", "ServiceType": "Kernel Mode Driver"}
            ])

    if anomalies_found:
        url = f"{server_url}/api/v1/threats/"
        try:
            res = requests.post(url, json=payload, timeout=5)
            if res.status_code == 200:
                logger.warning(f"Reported threat anomaly: {payload['alert_type']}")
        except Exception as e:
            logger.error(f"Failed to report threat anomaly: {e}")
