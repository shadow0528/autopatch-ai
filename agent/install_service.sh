#!/bin/bash
# AutoPatch AI Agent - Linux Systemd Installer

echo "=========================================================="
echo "🔥 AutoPatch AI Agent - Production Installer (Linux)"
echo "=========================================================="

# Require root privileges
if [ "$EUID" -ne 0 ]; then
  echo "Please run this installer as root (e.g., sudo ./install_service.sh)"
  exit 1
fi

INSTALL_DIR="/opt/autopatch-ai"
EXECUTABLE_PATH="$INSTALL_DIR/autopatch-ai-agent"
SERVICE_NAME="autopatch-ai-agent.service"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME"

echo "Checking for existing PyInstaller..."
if ! command -v pyinstaller &> /dev/null; then
    echo "PyInstaller not found. Installing via pip..."
    pip3 install pyinstaller psutil requests
fi

echo "Compiling Python source to standalone binary..."
pyinstaller --onefile --name "autopatch-ai-agent" --clean main.py

if [ ! -f "dist/autopatch-ai-agent" ]; then
    echo "Compilation failed! Cannot proceed with installation."
    exit 1
fi

echo "Staging binary to $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"
cp dist/autopatch-ai-agent "$EXECUTABLE_PATH"
chmod +x "$EXECUTABLE_PATH"

echo "Writing systemd service file..."
cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=AutoPatch AI Autonomous Orchestration Agent
After=network.target

[Service]
Type=simple
ExecStart=$EXECUTABLE_PATH
Restart=always
RestartSec=60
User=root
Environment="AGENT_AUTH_TOKEN=fallback-dev-key"

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd daemon..."
systemctl daemon-reload

echo "Enabling AutoPatch AI Agent on boot..."
systemctl enable "$SERVICE_NAME"

echo "Starting AutoPatch AI Agent..."
systemctl start "$SERVICE_NAME"

echo "=========================================================="
echo "✅ AutoPatch AI Agent installed and running successfully!"
echo "Use 'systemctl status $SERVICE_NAME' to check logs."
echo "=========================================================="
