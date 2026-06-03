<#
.SYNOPSIS
    Installs the AutoPatch AI Agent as a persistent Windows Background Service.

.DESCRIPTION
    This script will install a PRE-COMPILED AutoPatch AI Agent (autopatch-ai-agent.exe)
    using sc.exe to ensure it starts automatically on boot and runs as the local SYSTEM account.
    This script does NOT require Python or PyInstaller on the endpoint.

.NOTES
    Before running this script, ensure `autopatch-ai-agent.exe` is placed in the same
    directory as this script, or explicitly provide its path.
#>

param (
    [string]$SourceExe = ".\autopatch-ai-agent.exe"
)

$ServiceName = "AutoPatchAIAgent"
$ServiceDisplayName = "AutoPatch AI Orchestration Agent"
$ServiceDescription = "Autonomous Vulnerability Remediation & Endpoint Orchestration Agent Polling Service"
$InstallPath = "C:\Program Files\AutoPatchAI"
$ExecutablePath = "$InstallPath\autopatch-ai-agent.exe"

Write-Host "=========================================================="
Write-Host "🔥 AutoPatch AI Agent - Production Installer Wizard"
Write-Host "=========================================================="

# 1. Verify Source Executable Exists
if (-not (Test-Path -Path $SourceExe)) {
    Write-Error "Source executable not found at '$SourceExe'."
    Write-Error "This endpoint installer requires the pre-compiled binary. Please place 'autopatch-ai-agent.exe' in the same folder as this script and run it again."
    Exit 1
}

# 2. Stop and remove existing service if it exists
$ExistingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($ExistingService) {
    Write-Host "Service $ServiceName already exists. Stopping and removing..."
    Stop-Service -Name $ServiceName -Force
    sc.exe delete $ServiceName
    Start-Sleep -Seconds 2
}

# 3. Copy Executable to Target Directory
Write-Host "Staging binary to Enterprise execution directory: $InstallPath"
if (-not (Test-Path -Path $InstallPath)) {
    New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
}
Copy-Item -Path $SourceExe -Destination $ExecutablePath -Force

# 4. Create the new service
Write-Host "Creating Windows Service: $ServiceName..."
# sc.exe syntax requires exact spacing around =
$createResult = sc.exe create $ServiceName binPath= "`"$ExecutablePath`"" start= auto DisplayName= "`"$ServiceDisplayName`""
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create service. Ensure you are running as Administrator."
    Exit 1
}

# 5. Set Description
sc.exe description $ServiceName "`"$ServiceDescription`""

# 6. Configure Automatic Recovery (Restart on Failure)
Write-Host "Configuring Service Recovery Actions..."
sc.exe failure $ServiceName reset= 86400 actions= restart/60000/restart/60000/restart/60000

# 7. Start the service
Write-Host "Starting Service..."
Start-Service -Name $ServiceName

# 8. Verify Service Status
$FinalStatus = Get-Service -Name $ServiceName
if ($FinalStatus.Status -eq 'Running') {
    Write-Host "AutoPatch AI Agent successfully installed and is now RUNNING." -ForegroundColor Green
} else {
    Write-Warning "Service was installed but failed to start. Check Event Viewer or agent logs for details."
}
