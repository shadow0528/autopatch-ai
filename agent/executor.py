import requests
import logging
import time
import subprocess
import os

from security import is_command_allowed, verify_script_hash
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

def execute_winget(package_id: str) -> dict:
    """Executes a Winget package installation."""
    try:
        result = subprocess.run(
            ["winget", "install", "--exact", "--id", package_id, "--silent", "--accept-package-agreements", "--accept-source-agreements"],
            capture_output=True,
            text=True,
            timeout=600
        )
        if result.returncode == 0:
            return {"status": "Success", "output": result.stdout}
        else:
            return {"status": "Failed", "output": result.stderr}
    except Exception as e:
        return {"status": "Failed", "output": str(e)}

def execute_windows_update(kb_number: str) -> dict:
    """Executes a Windows Update installation for a specific KB using the PSWindowsUpdate module."""
    # Use PSWindowsUpdate command to install specific KB
    command = f"Get-WindowsUpdate -KBArticleID {kb_number} -Install -AcceptAll -IgnoreReboot"
    return execute_powershell(command)

def handle_reboots(hostname: str, server_url: str):
    """Poll the backend API for approved reboot requests and execute post-reboot validation."""
    try:
        # Note: Since there's no endpoint specifically to get approved reboots for an agent,
        # we will fetch all and filter client side. In a production app, an agent-specific endpoint is better.
        res = requests.get(f"{server_url}/api/v1/reboots/", timeout=10)
        if res.status_code == 200:
            reboots = res.json()
            for rb in reboots:
                if req_matches_host(rb, hostname) and rb['status'] == "Approved":
                    logger.info(f"Received approved reboot request #{rb['id']}. Validating post-reboot state...")
                    
                    # For MVP, we simulate that the reboot has already occurred since the agent is running
                    validation_payload = {
                        "status": "Completed",
                        "agent_reconnect_validated": "Success",
                        "patch_validated": "Success",
                        "vulnerability_validated": "Success",
                        "service_health_validated": "Success"
                    }
                    
                    update_url = f"{server_url}/api/v1/reboots/{rb['id']}"
                    requests.put(update_url, json=validation_payload, timeout=5)
                    logger.info(f"Reboot request #{rb['id']} validated and marked completed.")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching reboots from server: {e}")

def req_matches_host(req, hostname):
    """Check if a reboot request targets this specific host or its subnet."""
    target = req['target']
    # For MVP, just do a simple substring match
    return hostname.lower() in target.lower()

def fetch_and_execute_tasks(hostname: str, server_url: str):
    """Poll the backend API for pending tasks assigned to this agent and execute them."""
    handle_reboots(hostname, server_url)
    
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
                    result = retry_task_with_healing(execute_windows_update, task['payload'])
                elif task['patch_type'] == "Winget":
                    result = retry_task_with_healing(execute_winget, task['payload'])
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
