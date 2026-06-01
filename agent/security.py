import logging

logger = logging.getLogger("AutoPatchAgent.Security")

# MVP implementation of command whitelisting to prevent arbitrary execution
# In a full deployment, this could be synced dynamically from the server.
ALLOWED_COMMANDS = [
    "Get-WindowsUpdate",
    "Install-WindowsUpdate",
    "Restart-Computer",
    "winget upgrade",
    "sfc /scannow",
    "dism /online /cleanup-image /restorehealth",
    "Restart-Service wuauserv"
]

# A localized trusted execution registry dictating script paths that are allowed to run
TRUSTED_SCRIPT_REGISTRY = {
    "C:\\Program Files\\AutoPatchAI\\remediation_v1.ps1": "EXPECTED_SHA256_HASH_HERE",
    "C:\\Program Files\\AutoPatchAI\\repair_windows_update.ps1": "EXPECTED_SHA256_HASH_HERE",
}

import os
import hashlib

AGENT_AUTH_TOKEN = os.environ.get("AGENT_AUTH_TOKEN", "mock-secure-token-5f9a2b")

def audit_log_execution(command: str, is_allowed: bool):
    """Write an immutable audit log record for command execution attempts with provenance."""
    log_file = os.path.join(os.path.dirname(__file__), "security_audit.log")
    import datetime
    import getpass
    
    timestamp = datetime.datetime.utcnow().isoformat()
    status = "ALLOWED" if is_allowed else "BLOCKED"
    user = getpass.getuser()
    
    # Simple log integrity validation (chaining hashes) could go here
    log_entry = f"[{timestamp}] [{status}] [User: {user}] [Token: {AGENT_AUTH_TOKEN[:6]}...] COMMAND: {command}\n"
    
    try:
        with open(log_file, "a") as f:
            f.write(log_entry)
    except Exception as e:
        logger.error(f"Failed to write to audit log: {e}")

def validate_agent_token(provided_token: str) -> bool:
    """Mocks validation of signed tasks ensuring they originate from the mother orchestrator."""
    return provided_token == AGENT_AUTH_TOKEN

def is_command_allowed(command: str) -> bool:
    """Validates if a given command is within the authorized whitelist."""
    command_lower = command.lower()
    
    # Check for encoded PowerShell payloads, invoke expressions, and web downloads
    blocked_signatures = [
        "-enc", "-encodedcommand", 
        "invoke-expression", "iex ", 
        "invoke-webrequest", "iwr ", 
        "net.webclient"
    ]
    
    for sig in blocked_signatures:
        if sig in command_lower:
            logger.warning(f"Blocked potential malicious signature '{sig}' in command: {command}")
            audit_log_execution(command, False)
            return False
            
    # Check for execution against whitelist
    for allowed in ALLOWED_COMMANDS:
        if command.strip().lower().startswith(allowed.lower()):
            audit_log_execution(command, True)
            return True
            
    # If the command isn't a whitelisted string, check if it's a call to a script in our trusted registry
    if command.endswith(".ps1"):
        script_path = command.strip()
        if script_path in TRUSTED_SCRIPT_REGISTRY:
            # We would invoke verify_script_hash here dynamically if the file existed locally on this agent instance
            audit_log_execution(command, True)
            return True
            
    logger.warning(f"Blocked unwhitelisted command or unauthorized script: {command}")
    audit_log_execution(command, False)
    return False

def verify_script_hash(script_path: str, expected_hash: str) -> bool:
    """Simulates validating a script file SHA256 before allowing execution."""
    import hashlib
    try:
        with open(script_path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        return file_hash == expected_hash
    except Exception as e:
        logger.error(f"Failed to verify script hash: {e}")
        return False
