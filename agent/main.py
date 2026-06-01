import os
import time
import socket
import psutil
import platform
import threading
import requests
import logging

from discovery import run_discovery_scan
from executor import fetch_and_execute_tasks
from monitoring import check_for_anomalies

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("AutoPatchAgent")

# Server Configuration
SERVER_URL = os.environ.get("AUTOPATCH_SERVER_URL", "http://127.0.0.1:8000")
AGENT_VERSION = "1.0.0"

# Fetch polling intervals from environment variables (with defaults)
HEARTBEAT_INTERVAL = int(os.environ.get("AGENT_HEARTBEAT_INTERVAL", 30))
DISCOVERY_INTERVAL = int(os.environ.get("AGENT_DISCOVERY_INTERVAL", 300))
EXECUTOR_INTERVAL = int(os.environ.get("AGENT_EXECUTOR_INTERVAL", 15))
MONITORING_INTERVAL = int(os.environ.get("AGENT_MONITORING_INTERVAL", 60))

def get_system_info():
    """Gathers basic system metrics to send to the server."""
    hostname = socket.gethostname()
    
    # Attempt to get primary IP address by establishing a dummy connection
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip_address = s.getsockname()[0]
        s.close()
    except Exception:
        ip_address = socket.gethostbyname(hostname)

    cpu_utilization = psutil.cpu_percent(interval=1)
    memory_info = psutil.virtual_memory()
    memory_utilization = memory_info.percent
    
    # Note: Backend does not accept os_version right now based on our schema.
    # We will log it here but omit it from the heartbeat payload.
    os_version = f"{platform.system()} {platform.release()}"
    
    return {
        "hostname": hostname,
        "ip_address": ip_address,
        "cpu_utilization": cpu_utilization,
        "memory_utilization": memory_utilization,
        "agent_version": AGENT_VERSION
    }

def send_heartbeat():
    """Sends a heartbeat to the server and registers the agent if it doesn't exist."""
    info = get_system_info()
    url = f"{SERVER_URL}/api/v1/agents/heartbeat"
    
    try:
        response = requests.post(url, json=info, timeout=10)
        if response.status_code == 200:
            logger.info(f"Successfully sent heartbeat. CPU: {info['cpu_utilization']}%, Mem: {info['memory_utilization']}%")
        else:
            logger.error(f"Failed to send heartbeat. Status code: {response.status_code}. Response: {response.text}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error connecting to server {SERVER_URL}: {e}")

def executor_loop(hostname):
    """Background thread to regularly poll for patch tasks."""
    while True:
        try:
            fetch_and_execute_tasks(hostname, SERVER_URL)
        except Exception as e:
            logger.error(f"Error during execution poll: {e}")
        time.sleep(EXECUTOR_INTERVAL)

def monitoring_loop(hostname):
    """Background thread to look for endpoint anomalies and report threats."""
    while True:
        try:
            check_for_anomalies(hostname, SERVER_URL)
        except Exception as e:
            logger.error(f"Error during threat monitoring: {e}")
        time.sleep(MONITORING_INTERVAL)

def discovery_loop(hostname, ip_address):
    """Background thread to run subnet discovery periodically."""
    # Assuming a /24 subnet for MVP purposes based on the agent IP
    # In a real environment, this might be dynamically determined or assigned by the server
    parts = ip_address.split('.')
    if len(parts) == 4:
        subnet = f"{parts[0]}.{parts[1]}.{parts[2]}.0/24"
    else:
        subnet = "192.168.1.0/24" # fallback
        
    while True:
        try:
            run_discovery_scan(subnet, SERVER_URL, hostname)
        except Exception as e:
            logger.error(f"Error during discovery scan: {e}")
            
        time.sleep(DISCOVERY_INTERVAL)

def main():
    logger.info(f"Starting AutoPatch Agent v{AGENT_VERSION}")
    logger.info(f"Configured Server URL: {SERVER_URL}")
    
    # Send initial heartbeat to register and get IP
    info = get_system_info()
    
    # Start discovery background thread
    discovery_thread = threading.Thread(
        target=discovery_loop, 
        args=(info['hostname'], info['ip_address']),
        daemon=True
    )
    discovery_thread.start()
    logger.info("Discovery background thread started.")
    
    # Start patch executor thread
    executor_thread = threading.Thread(
        target=executor_loop,
        args=(info['hostname'],),
        daemon=True
    )
    executor_thread.start()
    logger.info("Patch task executor thread started.")
    
    # Start threat monitoring thread
    monitoring_thread = threading.Thread(
        target=monitoring_loop,
        args=(info['hostname'],),
        daemon=True
    )
    monitoring_thread.start()
    logger.info("Threat monitoring thread started.")
    
    while True:
        send_heartbeat()
        time.sleep(HEARTBEAT_INTERVAL)

if __name__ == "__main__":
    main()
