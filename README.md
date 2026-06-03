# 🔥 AutoPatch AI Agent

**Autonomous Vulnerability Remediation & Endpoint Orchestration Platform**

AutoPatch AI Agent is a fully on-premise, lightweight, and scalable endpoint orchestration platform designed to automate vulnerability remediation, coordinate managed reboots, and detect suspicious threat anomalies across thousands of Windows assets. 

It provides an enterprise-grade experience unifying SOC/NOC telemetry, active orchestration workflows, and an immutable secure-execution agent.

Built for modern SOC/NOC environments, AutoPatch AI integrates seamless endpoint discovery with actionable patch deployments to drastically reduce mean time to remediation (MTTR) while keeping operations strictly isolated from cloud dependencies.

---

## 🏗️ Architecture

The platform operates via a polling architecture designed for low endpoint overhead and secure, one-way communication.

```text
                          +-----------------------+
                          |  SOC/NOC Dashboard    |
                          |  (Next.js / React)    |
                          +-----------+-----------+
                                      | (REST / JWT)
                                      v
                          +-----------------------+
                          |  Central Mother API   |
                          |  (FastAPI / SQLite)   |
                          +-----------+-----------+
                                      ^
         [Polls for Signed Tasks]     |    [Sends Heartbeats & Forensic JSON]
                                      |
            +-------------------------+-------------------------+
            |                         |                         |
        +---+---+                 +---+---+                 +---+---+
        | Agent |                 | Agent |                 | Agent |
        | Sub 1 |                 | Sub 2 |                 | Sub N |
        +---+---+                 +---+---+                 +---+---+
            |                         |                         |
 [Scans /24]|              [Scans /24]|              [Scans /24]|
 +----------+              +----------+              +----------+
 | (RDP/SMB)|              |          |              |          |
 v          |              v          |              v          |
[Shadow Assets]           [Shadow Assets]           [Shadow Assets]
```

### Reboot Orchestration Workflow

```text
[Patch Installs] --> [Reboot Required Flag Detected] --> [Reboot Queued]
                                                             |
   +---------------------------------------------------------+
   |
   v
[SOC Admin Approves] --> [Agent Checks Time-Window] --> [Executes Restart]
                                                             |
   +---------------------------------------------------------+
   |
   v
[Agent Reconnects] --> [Validates Patch State] --> [Reports "Completed"]
```

### Secure Execution Sandbox
AutoPatch AI enforces strict restrictions on endpoint remediation:
1. **Command Whitelist:** Only specific binaries (`winget`, `sfc`, `Get-WindowsUpdate`) are passed to the shell.
2. **Directory Sandbox:** Scripts (`.ps1`) only run if present within predefined enterprise locations (e.g., `C:\Program Files\AutoPatchAI\Scripts\`).
3. **Execution Provenance:** Cryptographic hash validation occurs automatically on all remote scripts, locking out `Invoke-Expression`, web-downloads, and encoded memory exploits.

### Core Components
1. **Central "Mother" Server**: A FastAPI/SQLAlchemy REST backend that orchestrates tasks, collects endpoint metrics, and maintains the centralized SQLite (or Postgres) inventory.
2. **Next.js Dashboard**: A dark-mode, cybersecurity-styled React web application featuring analytical charts, queue management, and real-time operational visibility.
3. **Lightweight Python Agent**: An endpoint-deployed polling client containing modular threads for heartbeat transmission, async subnet discovery, Powershell patch execution, and threat monitoring.

---

## ✨ Features

* **Subnet-Aware Host Discovery**: Asynchronous socket scanning on RDP (3389) and SMB (445) ports to detect shadow/unmanaged assets automatically.
* **Qualys CSV Integration**: Ingests bulk vulnerability assessments to track QIDs, severity, and remediation requirements globally.
* **Patch Orchestration Engine**: Securely executes `Install-WindowsUpdate`, `winget` upgrades, or approved PowerShell remediation scripts.
* **Controlled Reboot Approvals**: Separates patch installation from system reboots, enforcing administrative approval for single, batch, or entire subnet reboots with post-validation checks.
* **Failure Intelligence & Self-Healing**: Captures structured failure logs and automatically initiates diagnostic service restarts or `DISM`/`sfc` corruption repairs before retrying.
* **Threat Awareness Engine**: Continuously monitors endpoint CPU/Memory utilization and scans for unauthorized/malicious process executions (e.g. `mimikatz`), triggering instant alerts.
* **Strict Security Execution Model**: Employs immutable audit logging and a rigid command whitelist to block arbitrary remote execution or encoded PowerShell payloads.

---

## 📸 Dashboard Preview

*(Add screenshots here)*
* **Dashboard Overview**: `[Placeholder: dashboard_overview.png]`
* **Asset Inventory**: `[Placeholder: asset_inventory.png]`
* **Patch Orchestration Queue**: `[Placeholder: patch_queue.png]`
* **Reboot Approvals**: `[Placeholder: reboot_approvals.png]`
* **Threat Anomalies**: `[Placeholder: threat_alerts.png]`

---

## 🚀 Deployment Guide

### Prerequisites
* Python 3.9+
* Node.js v18+ & npm
* Windows OS (for Agent Endpoint deployment)

### 1. Database Migrations (Alembic)
If this is a fresh setup or pulling a recent update, execute the Alembic schema migrations natively:
```bash
cd server
alembic upgrade head
cd ..
```

### 2. Unified Installation Workflow
A `deploy.sh` script is bundled to rapidly install and configure the necessary python virtual environments and Next.js frontend requirements.

```bash
chmod +x deploy.sh
./deploy.sh
```

### 2. Service Execution
Once the installation script completes, utilize the local start script to boot the Master Server, local test Agent, and the Dashboard concurrently:

```bash
chmod +x startup.sh
./startup.sh
```

Access the dashboard at: `http://localhost:3000`

### 3. Mass Agent Deployment (3000+ Endpoints)
For enterprise rollout, endpoints **do not** require Python. You compile the agent once and distribute the binary using tools like SCCM, Intune, or GPO.

**Step A: Compile the Agent (Run ONCE on Admin/Build PC)**
1. On a machine with Python 3.10+ installed, open an Administrator PowerShell.
2. Navigate to `agent/` and run `.\build_windows_exe.ps1`.
3. This creates a standalone `autopatch-ai-agent.exe` inside the `agent/dist/` folder.

**Step B: Deploy to Endpoints (Run on Target Assets)**
1. Distribute the generated `autopatch-ai-agent.exe` and `install_service.ps1` to your endpoint.
2. Run `.\install_service.ps1` as Administrator.
3. The script will copy the `.exe` to `C:\Program Files\AutoPatchAI\` and register it as a resilient Windows Background Service.

---

## 🤖 AI & Future Enhancements Roadmap

We are actively evolving this orchestration tool into a full AI-driven cognitive system. The future roadmap includes:

- [ ] **LLM-Driven Diagnostic Triage**: Integrates local LLM models (e.g. Llama 3) directly into the `self_heal.py` agent to interpret arbitrary Windows exit codes on the fly and dynamically synthesize safe remediation plans without strict pre-programmed paths.
- [ ] **Heuristic Threat Correlation**: Incorporates machine learning to assign Bayesian probabilistic compromise scores rather than static anomaly triggers in the `monitoring.py` loops.
- [ ] **Active Directory Integration**: Sync managed endpoints directly with AD OUs.
- [ ] **PostgreSQL Migration**: Upgrade backend from SQLite to distributed Postgres for enterprise scale.
- [ ] **Role-Based Access Control (RBAC)**: Distinct permissions for NOC Operators vs SOC Analysts.
- [ ] **Full EDR Hooks**: Enhance the Threat Awareness engine with ETW (Event Tracing for Windows) logs.

### Troubleshooting

**Problem: Agent tasks are stuck in "Pending" state.**
* **Solution**: Verify the `AGENT_EXECUTOR_INTERVAL` variable is correctly exported in `.env` and that the agent's target hostname correctly aligns with the orchestration backend registry.

**Problem: Agent execution is blocked for legitimate PowerShell tasks.**
* **Solution**: Check the `security_audit.log` file on the endpoint. If your script uses aliases like `iex`, it will be blocked natively. Ensure your scripts are mapped within the `TRUSTED_SCRIPT_REGISTRY` dict in `agent/security.py`.

---

## 🤝 Contributing
Contributions are welcome! Please ensure any submitted code aligns with the strict security whitelist execution models and utilizes asynchronous patterns where applicable.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
