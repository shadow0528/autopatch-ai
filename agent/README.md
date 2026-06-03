# AutoPatch AI Agent

The AutoPatch AI Agent is a lightweight polling service that discovers subnets, executes patch playbooks, and reports telemetry back to the Mother server. 

To support mass deployment across 3000+ enterprise endpoints without requiring Python on every machine, you should compile the agent into a single executable (`.exe` or ELF) and deploy it via standard tooling (e.g., SCCM, Intune, GPO).

## 1. Building the Agent (Run ONCE on Admin/Build Machine)

Choose a single machine (your admin laptop or a CI/CD build server) that has Python installed.

**For Windows (`.exe`):**
1. Install Python 3.10+
2. Open PowerShell as Administrator in this folder.
3. Run the build script:
   ```powershell
   .\build_windows_exe.ps1
   ```
4. Once complete, you will find `autopatch-ai-agent.exe` inside the `dist\` folder. This is your "Golden Image" binary.

**For Linux (ELF):**
1. Install Python 3.10+
2. Run:
   ```bash
   python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt pyinstaller
   pyinstaller --onefile --noconsole --name "autopatch-ai-agent" main.py
   ```
3. Your binary will be located at `dist/autopatch-ai-agent`.

---

## 2. Mass Endpoint Deployment (Run on 3000+ Assets)

Now that you have your pre-compiled binary (`autopatch-ai-agent.exe`), you can deploy it to your endpoints. **The endpoints DO NOT need Python installed.**

### Windows Deployment
1. Take the generated `autopatch-ai-agent.exe` and `install_service.ps1`.
2. Push them to your endpoints (using SCCM, Intune, BigFix, or network share).
3. Ensure both files are in the same directory on the target endpoint.
4. Run the installer as SYSTEM or Administrator:
   ```powershell
   .\install_service.ps1
   ```
5. The script will copy the binary to `C:\Program Files\AutoPatchAI\` and register it as an auto-starting Windows Service.

### Linux Deployment
1. Take the generated `autopatch-ai-agent` binary and `install_service.sh`.
2. Push them to your endpoints.
3. Run the installer as root:
   ```bash
   chmod +x install_service.sh
   ./install_service.sh
   ```
