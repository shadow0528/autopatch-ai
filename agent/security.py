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
    "dism /online /cleanup-image /restorehealth"
]

def is_command_allowed(command: str) -> bool:
    """Validates if a given command is within the authorized whitelist."""
    # Simple check for MVP; real-world would need AST parsing or rigid parameter constraints
    for allowed in ALLOWED_COMMANDS:
        if command.strip().lower().startswith(allowed.lower()):
            return True
            
    # Check for encoded PowerShell payloads, block them entirely
    if "-enc" in command.lower() or "-encodedcommand" in command.lower():
        logger.warning(f"Blocked potential malicious encoded command: {command}")
        return False
        
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
