<#
.SYNOPSIS
    Builds the AutoPatch AI Agent into a standalone Windows .exe

.DESCRIPTION
    Run this script ONCE on an Admin PC or Build Server that has Python installed.
    It will create a self-contained `autopatch-ai-agent.exe` inside the `dist\` folder.
    You can then take that single `.exe` file and distribute it to all 3000+ endpoints
    alongside `install_service.ps1` to install it without needing Python on those endpoints.
#>

Write-Host "=========================================================="
Write-Host "🔨 AutoPatch AI Agent - Windows Golden Image Builder"
Write-Host "=========================================================="

# 1. Check for Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python is required on THIS build machine to generate the .exe. Please install Python 3.10+."
    Exit 1
}

# 2. Install Requirements
Write-Host "Installing dependencies..."
pip install -r requirements.txt
pip install pyinstaller

# 3. Build the EXE
Write-Host "Compiling agent to a standalone Windows Executable..."
pyinstaller --onefile --noconsole --name "autopatch-ai-agent" --clean --noupx main.py

if (Test-Path "dist\autopatch-ai-agent.exe") {
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "✅ BUILD SUCCESS!" -ForegroundColor Green
    Write-Host "Your standalone binary is located at: .\dist\autopatch-ai-agent.exe" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS FOR MASS DEPLOYMENT:"
    Write-Host "1. Copy 'dist\autopatch-ai-agent.exe' and 'install_service.ps1' to a shared drive or deployment tool (SCCM/Intune)."
    Write-Host "2. On your endpoints, run 'install_service.ps1' as Administrator."
    Write-Host "   (Endpoints DO NOT need Python or Pyinstaller installed)."
} else {
    Write-Error "Build failed. Check the logs above."
}
