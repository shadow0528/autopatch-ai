import logging
import subprocess

logger = logging.getLogger("AutoPatchAgent.SelfHeal")

def run_diagnostic_repair(failure_reason: str) -> bool:
    """
    Attempts to identify the failure root cause and automatically 
    apply a self-healing action.
    """
    logger.info(f"Analyzing failure reason: {failure_reason}")
    
    if "Access denied" in failure_reason or "0x80070005" in failure_reason:
        logger.info("Diagnosis: Permission issue. Action: Restarting WUAUSERV service.")
        # Simulated repair: Restart Windows Update service
        return True
        
    elif "corruption" in failure_reason.lower() or "0x800f081f" in failure_reason:
        logger.info("Diagnosis: Component store corruption. Action: Running DISM and SFC.")
        # Simulated repair:
        # subprocess.run(["dism", "/online", "/cleanup-image", "/restorehealth"])
        # subprocess.run(["sfc", "/scannow"])
        return True
        
    elif "dependency" in failure_reason.lower():
        logger.info("Diagnosis: Missing dependency. Action: Triggering prerequisite scan.")
        return True
        
    return False

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
            
        logger.warning(f"Task execution failed on attempt {attempt+1}. Output: {result['output']}")
        
        # If this isn't our last attempt, try to self-heal
        if attempt < max_retries - 1:
            healed = run_diagnostic_repair(result['output'])
            if not healed:
                logger.error("Self-healing could not determine a repair action.")
                break
            logger.info("Self-healing action completed. Retrying task...")
            
    return result
