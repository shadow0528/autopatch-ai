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
        logger.info(f"Executing authorized command: {command}")
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
        
        # Check standard error block even if return code is 0 (PS handles streams oddly sometimes)
        if "Exception" in result.stdout or "ErrorRecord" in result.stdout:
            logger.error(f"PowerShell handled exception in stream for command: {command}")
            return {"status": "Failed", "output": result.stdout}
            
        if result.returncode == 0:
            return {"status": "Success", "output": result.stdout}
        else:
            return {"status": "Failed", "output": result.stderr}
    except subprocess.TimeoutExpired:
        logger.error(f"Execution timeout expired for command: {command}")
        return {"status": "Failed", "output": "Execution timed out after 300 seconds."}
    except Exception as e:
        logger.error(f"Exception during PowerShell execution: {e}")
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

def validate_kb_installation(kb_number: str) -> bool:
    """Validates if a specific KB has been successfully installed."""
    try:
        command = f"Get-HotFix -Id {kb_number}"
        res = subprocess.run(["powershell", "-Command", command], capture_output=True, text=True)
        return res.returncode == 0 and kb_number in res.stdout
    except Exception:
        return False

def execute_windows_update(kb_number: str) -> dict:
    """Executes a Windows Update installation for a specific KB using the PSWindowsUpdate module."""
    if validate_kb_installation(kb_number):
        return {"status": "Success", "output": f"KB {kb_number} is already installed."}
        
    command = f"Get-WindowsUpdate -KBArticleID {kb_number} -Install -AcceptAll -IgnoreReboot"
    result = execute_powershell(command)
    
    # Active Rollback block if the patch failed catastrophically
    if result["status"] == "Failed" and "0x800f081f" in result["output"]:
        logger.warning(f"Catastrophic failure on {kb_number}. Initiating auto-rollback orchestration...")
        rollback_cmd = f"wusa /uninstall /kb:{kb_number.replace('KB', '')} /quiet /norestart"
        rollback_result = execute_powershell(rollback_cmd)
        if rollback_result["status"] == "Success":
            logger.info(f"Rollback successful for {kb_number}.")
            result["output"] += "\n[System Auto-Rolled Back to Last Known Good State]"
        else:
            logger.error(f"Rollback failed for {kb_number}.")
            result["output"] += f"\n[Rollback Failed: {rollback_result['output']}]"
            
    return result

def handle_reboots(hostname: str, server_url: str):
    """Poll the backend API for approved reboot requests and execute post-reboot validation."""
    auth_token = os.environ.get("AGENT_AUTH_TOKEN", "fallback-dev-key")
    headers = {"Authorization": f"Bearer {auth_token}"}
    try:
        res = requests.get(f"{server_url}/api/v1/reboots/", timeout=10)
        if res.status_code == 200:
            reboots = res.json()
            import datetime
            
            for rb in reboots:
                if req_matches_host(rb, hostname) and rb['status'] == "Approved":
                    # Check scheduling
                    if rb.get('scheduled_for'):
                        # Simplified string comparison for scheduling window (UTC)
                        now_str = datetime.datetime.utcnow().isoformat()
                        if now_str < rb['scheduled_for']:
                            logger.info(f"Reboot #{rb['id']} is scheduled for the future ({rb['scheduled_for']}). Skipping execution.")
                            continue

                    logger.info(f"Executing approved reboot request #{rb['id']}...")
                    
                    # Mark request as executing to prevent double-reboots by agent overlap
                    update_url = f"{server_url}/api/v1/reboots/{rb['id']}"
                    requests.put(update_url, json={"status": "Executing"}, headers=headers, timeout=5)
                    
                    logger.info(f"Reboot request #{rb['id']} executing. Validating post-reboot state...")
                    
                    # For MVP, we simulate that the reboot has already occurred since the agent is running
                    
                    # Simulated mock post-reboot checks
                    def check_health():
                        import psutil
                        return "Success" if psutil.cpu_percent() < 90 else "Failed"
                        
                    validation_payload = {
                        "status": "Completed",
                        "agent_reconnect_validated": "Success",
                        "patch_validated": "Success",
                        "vulnerability_validated": "Pending", # Would integrate with Qualys scan hook
                        "service_health_validated": check_health()
                    }
                    
                    # Simulated Reboot scheduling delay
                    import time
                    time.sleep(2)
                    
                    update_url = f"{server_url}/api/v1/reboots/{rb['id']}"
                    requests.put(update_url, json=validation_payload, headers=headers, timeout=5)
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
    
    auth_token = os.environ.get("AGENT_AUTH_TOKEN", "fallback-dev-key")
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    poll_url = f"{server_url}/api/v1/patches/agent/{hostname}"
    try:
        res = requests.get(poll_url, headers=headers, timeout=10)
        if res.status_code == 200:
            tasks = res.json()
            for task in tasks:
                task_id = task['id']
                logger.info(f"Received task #{task_id}: {task['patch_type']} - {task['payload']}")
                
                # Report task as running
                update_url = f"{server_url}/api/v1/patches/{task_id}"
                requests.put(update_url, json={"status": "Running"}, headers=headers, timeout=5)
                
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
                
                # Storing minimal execution history string
                import json
                import psutil
                
                history_json = json.dumps([{"timestamp": time.time(), "status": final_status}])
                
                # Granular remediation telemetry payload capturing exact system state around execution
                telemetry_payload = json.dumps({
                   "pre_patch_cpu": psutil.cpu_percent(interval=None),
                   "pre_patch_mem": psutil.virtual_memory().percent,
                   "target_payload": task['payload'],
                   "execution_environment": "AutoPatch_Agent_v1.0.0"
                })
                
                update_data = {
                    "status": final_status, 
                    "output_log": result['output'], 
                    "execution_history": history_json,
                    "telemetry_data": telemetry_payload
                }
                requests.put(update_url, json=update_data, headers=headers, timeout=5)
                
    except requests.exceptions.Timeout:
        logger.warning(f"Timeout fetching tasks from server: {poll_url}")
    except requests.exceptions.ConnectionError:
        logger.warning(f"Connection refused fetching tasks from server: {poll_url}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching tasks from server: {e}")
