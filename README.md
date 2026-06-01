# AutoPatch AI Agent

This is an R&D lab project that aims to become a working MVP for a fully on-prem autonomous vulnerability remediation and patch orchestration platform.

## Features (Phase 1)
- Backend skeleton
- Database models
- Agent registration
- Heartbeat
- Dashboard basics (Next.js)

## How to run locally

### 1. Backend Server Setup
To run the server, ensure you have Python 3.9+ installed.

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. Access the API documentation:
   Open a browser and navigate to `http://localhost:8000/docs` to see the Swagger UI.

### 2. Testing the APIs (Phase 1)

**Heartbeat / Registration API**
```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/agents/heartbeat' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "hostname": "win-server-01",
  "ip_address": "192.168.1.100",
  "cpu_utilization": 15.5,
  "memory_utilization": 45.2,
  "agent_version": "1.0.0"
}'
```

**List Agents**
```bash
curl -X 'GET' \
  'http://localhost:8000/api/v1/agents/' \
  -H 'accept: application/json'
```

### 3. Dashboard Server Setup
To run the dashboard, ensure you have Node.js and npm installed.

1. Navigate to the `dashboard` directory:
   ```bash
   cd dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the Next.js development server:
   ```bash
   npm run dev
   ```

4. Access the dashboard:
   Open a browser and navigate to `http://localhost:3000`. Ensure your backend server is running on port 8000.
