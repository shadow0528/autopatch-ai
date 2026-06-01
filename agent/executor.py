import requests
import logging
import time
import subprocess
import os

from security import is_command_allowed
from self_heal import retry_task_with_healing

logger = logging.getLogger("AutoPatchAgent.Executor")

def execute_powershell(command: str) -> dict:
    """Executes a PowerShell script or command in a secure manner."""
    if not is_command_allowed(command):
        logger.error(f"Security Policy Violation: Command blocked - {command}")
        return {"status": "Failed", "output": "Execution blocked by agent security policy."}
        
    try:
        result = subprocess.run(
            ["powershell", "-Command", command],
            capture_output=True,
            text=True,
            timeout=300
        )
        if result.returncode == 0:
            return {"status": "Success", "output": result.stdout}
        else:
            return {"status": "Failed", "output": result.stderr}
    except Exception as e:
        return {"status": "Failed", "output": str(e)}

def fetch_and_execute_tasks(hostname: str, server_url: str):
    """Poll the backend API for pending tasks assigned to this agent and execute them."""
    poll_url = f"{server_url}/api/v1/patches/agent/{hostname}"
    try:
        res = requests.get(poll_url, timeout=10)
        if res.status_code == 200:
            tasks = res.json()
            for task in tasks:
                task_id = task['id']
                logger.info(f"Received task #{task_id}: {task['patch_type']} - {task['payload']}")
                
                # Report task as running
                update_url = f"{server_url}/api/v1/patches/{task_id}"
                requests.put(update_url, json={"status": "Running"}, timeout=5)
                
                # Execute action based on type with self-healing retry logic
                if task['patch_type'] == "PowerShell":
                    result = retry_task_with_healing(execute_powershell, task['payload'])
                elif task['patch_type'] == "Windows Update":
                    # Mock Windows Update execution 
                    def mock_wu(payload):
                        time.sleep(2)
                        return {"status": "Success", "output": f"Successfully applied update {payload}."}
                    result = retry_task_with_healing(mock_wu, task['payload'])
                else:
                    result = {"status": "Failed", "output": "Unsupported patch type."}
                
                # Determine final status
                final_status = result['status']
                
                # If patches require a reboot, orchestrator changes status
                if "REBOOT_REQUIRED" in result['output']:
                    final_status = "Reboot Pending"
                    
                logger.info(f"Task #{task_id} finished with status: {final_status}")
                requests.put(update_url, json={"status": final_status, "output_log": result['output']}, timeout=5)
                
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching tasks from server: {e}")
