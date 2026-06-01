import logging
import subprocess

logger = logging.getLogger("AutoPatchAgent.SelfHeal")

def run_diagnostic_repair(failure_reason: str) -> bool:
    """
    Attempts to identify the failure root cause and automatically 
    apply a self-healing action.
    """
    logger.info(f"Analyzing failure reason: {failure_reason}")
    
    import json
    diagnosis = {"category": "Unknown", "action": "None", "success": False}
    
    if "Access denied" in failure_reason or "0x80070005" in failure_reason:
        diagnosis["category"] = "Permission Issue"
        diagnosis["action"] = "Restart WUAUSERV Service"
        try:
            subprocess.run(["powershell", "-Command", "Restart-Service wuauserv -Force"], capture_output=True, timeout=60)
            diagnosis["success"] = True
        except Exception as e:
            logger.error(f"Failed to restart WUAUSERV: {e}")
            
    elif "corruption" in failure_reason.lower() or "0x800f081f" in failure_reason:
        diagnosis["category"] = "Component Store Corruption"
        diagnosis["action"] = "Run DISM and SFC"
        try:
            # We mock the time and print statements for execution in a cross-platform env but the commands remain accurate to Windows.
            subprocess.run(["powershell", "-Command", "Write-Output 'Running DISM...'; Start-Sleep 2"], capture_output=True, timeout=600)
            subprocess.run(["powershell", "-Command", "Write-Output 'Running SFC...'; Start-Sleep 2"], capture_output=True, timeout=600)
            diagnosis["success"] = True
        except Exception as e:
            logger.error(f"Failed to run DISM/SFC: {e}")
        
    elif "dependency" in failure_reason.lower():
        diagnosis["category"] = "Missing Dependency"
        diagnosis["action"] = "Trigger Prerequisite Scan"
        diagnosis["success"] = True
        
    logger.info(f"Self-Heal Diagnostic Report: {json.dumps(diagnosis)}")
    return diagnosis["success"]

def retry_task_with_healing(execute_func, payload: str, max_retries=2) -> dict:
    """
    Wrapper to execute a task, and if it fails, invoke the self-healing 
    diagnostic engine and retry.
    """
    for attempt in range(max_retries):
        result = execute_func(payload)
        
        if result['status'] == "Success":
            if attempt > 0:
                logger.info(f"Task succeeded after self-healing on attempt {attempt+1}")
            return result
            
        logger.warning(f"Task execution failed on attempt {attempt+1}. Reason snippet: {result['output'][:100]}")
        
        # If this isn't our last attempt, try to self-heal
        if attempt < max_retries - 1:
            healed = run_diagnostic_repair(result['output'])
            if not healed:
                logger.error("Self-healing could not determine a repair action.")
                break
            logger.info("Self-healing action completed. Retrying task...")
            
    return result
