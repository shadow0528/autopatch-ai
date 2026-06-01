#!/bin/bash
# AutoPatch AI Deployment Workflow

echo "===================================================="
echo "🔥 AutoPatch AI Agent - Deployment Wizard"
echo "===================================================="
echo "Checking Environment Requirements..."

# 1. Dependency checks
if ! command -v python3 &> /dev/null
then
    echo "ERROR: python3 is not installed or not in PATH."
    exit 1
fi

if ! command -v npm &> /dev/null
then
    echo "ERROR: npm is not installed or not in PATH."
    exit 1
fi

echo "Requirements met."

# 2. Env check
if [ ! -f ".env" ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
fi

# 3. Setup Backend
echo ""
echo "[1/3] Setting up Backend API Engine..."
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# 4. Setup Frontend
echo ""
echo "[2/3] Setting up Dashboard UI..."
cd dashboard
npm install
npm run build
cd ..

# 5. Setup Agent Locally (For testing)
echo ""
echo "[3/3] Setting up Local Test Agent..."
cd agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "===================================================="
echo "✅ Deployment Successful!"
echo "To start the platform, run: ./startup.sh"
echo "===================================================="
