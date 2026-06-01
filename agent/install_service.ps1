<#
.SYNOPSIS
    Installs the AutoPatch AI Agent as a persistent Windows Background Service.

.DESCRIPTION
    This script will register the compiled AutoPatch AI Agent (autopatch-ai-agent.exe) 
    using NSSM (Non-Sucking Service Manager) or sc.exe to ensure it starts automatically 
    on boot and runs as the local SYSTEM account.

.NOTES
    Before running this script, you must compile the agent into a single executable:
    > pip install pyinstaller
    > pyinstaller --onefile --noconsole main.py
    
    Then place the resulting `main.exe` (renamed to `autopatch-ai-agent.exe`) 
    into C:\Program Files\AutoPatchAI\.
#>

$ServiceName = "AutoPatchAIAgent"
$ServiceDisplayName = "AutoPatch AI Orchestration Agent"
$ServiceDescription = "Autonomous Vulnerability Remediation & Endpoint Orchestration Agent Polling Service"
$InstallPath = "C:\Program Files\AutoPatchAI"
$ExecutablePath = "$InstallPath\autopatch-ai-agent.exe"

# 1. Verify Executable Exists
if (-not (Test-Path -Path $ExecutablePath)) {
    Write-Error "Could not find $ExecutablePath. Please ensure the agent has been compiled via PyInstaller and placed in the correct directory."
    exit 1
}

# 2. Stop and remove existing service if it exists
$ExistingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($ExistingService) {
    Write-Host "Service $ServiceName already exists. Stopping and removing..."
    Stop-Service -Name $ServiceName -Force
    sc.exe delete $ServiceName
    Start-Sleep -Seconds 2
}

# 3. Create the new service
Write-Host "Creating Windows Service: $ServiceName..."
$createResult = sc.exe create $ServiceName binPath= "`"$ExecutablePath`"" start= auto DisplayName= $ServiceDisplayName
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create service. Ensure you are running as Administrator."
    exit 1
}

# 4. Set Description
sc.exe description $ServiceName $ServiceDescription

# 5. Start the service
Write-Host "Starting Service..."
Start-Service -Name $ServiceName

# 6. Verify Service Status
$FinalStatus = Get-Service -Name $ServiceName
if ($FinalStatus.Status -eq 'Running') {
    Write-Host "AutoPatch AI Agent successfully installed and is now RUNNING." -ForegroundColor Green
} else {
    Write-Warning "Service was installed but failed to start. Check Event Viewer or agent logs for details."
}
