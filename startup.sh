#!/bin/bash
echo "Starting AutoPatch AI Agent Platform..."

# Start Backend Server
cd server
if [ ! -d "venv" ]; then
    echo "Creating backend virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
echo "Starting Backend Server on port 8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
cd ..

# Start Frontend Dashboard
cd dashboard
echo "Installing frontend dependencies..."
npm install > /dev/null 2>&1
echo "Starting Dashboard on port 3000..."
npm run dev &
cd ..

# Start Local Agent
cd agent
if [ ! -d "venv" ]; then
    echo "Creating agent virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
echo "Starting Local Node Agent..."
python3 main.py &
cd ..

echo "Platform successfully started!"
echo "Access the Dashboard at http://localhost:3000"
echo "Press Ctrl+C to stop all services."

trap "kill 0" SIGINT
wait
