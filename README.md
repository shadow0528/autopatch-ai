# 🔥 AutoPatch AI Agent

**Autonomous Vulnerability Remediation & Endpoint Orchestration Platform**

AutoPatch AI Agent is a fully on-premise, lightweight, and scalable endpoint orchestration platform designed to automate vulnerability remediation, coordinate managed reboots, and detect suspicious threat anomalies across thousands of Windows assets. 

Built for modern SOC/NOC environments, AutoPatch AI integrates seamless endpoint discovery with actionable patch deployments to drastically reduce mean time to remediation (MTTR) while keeping operations strictly isolated from cloud dependencies.

---

## 🏗️ Architecture

The platform operates via a polling architecture designed for low endpoint overhead and secure, one-way communication.

```text
                  +-----------------------+
                  |  SOC/NOC Dashboard    |
                  |  (Next.js / React)    |
                  +-----------+-----------+
                              |
                              v
                  +-----------------------+
                  |  Central Mother API   |
                  |  (FastAPI / SQLite)   |
                  +-----------+-----------+
                              ^
        [Polls for Tasks]     |    [Sends Heartbeats & Threats]
                              |
    +-------------------------+-------------------------+
    |                         |                         |
+---+---+                 +---+---+                 +---+---+
| Agent |                 | Agent |                 | Agent |
| Sub 1 |                 | Sub 2 |                 | Sub N |
+---+---+                 +---+---+                 +---+---+
    |                         |                         |
[Scans /24]               [Scans /24]               [Scans /24]
```

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

## 🚀 Setup Instructions

### Prerequisites
* Python 3.9+
* Node.js v18+ & npm
* Windows OS (for Agent deployment)

### 1. Configuration Setup
Create a `.env` file in the root directory based on the provided template:
```bash
cp .env.example .env
```

### 2. Run All Services
A convenient `startup.sh` script is provided to spin up the backend, frontend, and local agent concurrently.
```bash
chmod +x startup.sh
./startup.sh
```

### Manual Execution

**Backend Server**
```bash
cd server
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend Dashboard**
```bash
cd dashboard
npm install
npm run dev
```

**Local Windows Agent**
```bash
cd agent
python -m venv venv && source venv/Scripts/activate
pip install -r requirements.txt
python main.py
```

Access the dashboard at: `http://localhost:3000`

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **Active Directory Integration**: Sync managed endpoints directly with AD OUs.
- [ ] **PostgreSQL Migration**: Upgrade backend from SQLite to distributed Postgres for enterprise scale.
- [ ] **Role-Based Access Control (RBAC)**: Distinct permissions for NOC Operators vs SOC Analysts.
- [ ] **Full EDR Hooks**: Enhance the Threat Awareness engine with ETW (Event Tracing for Windows) logs.

---

## 🤝 Contributing
Contributions are welcome! Please ensure any submitted code aligns with the strict security whitelist execution models and utilizes asynchronous patterns where applicable.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
