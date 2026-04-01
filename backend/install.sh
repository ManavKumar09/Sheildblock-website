#!/bin/bash

# ShieldBlock: Automated Raspberry Pi Setup Script (Production Ready)
# Usage: sudo bash install.sh <UNIQUE_ID>

set -e

# --- Configuration ---
INSTALL_DIR="/opt/shieldblock"
SERVICE_NAME="shieldblock.service"
# Placeholder for the cloud API endpoint
API_BASE_URL="https://api.shieldblock.com" 

# --- Colors for Output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== ShieldBlock Installation Starting ===${NC}"

# 1. Root Enforcement
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root (use sudo).${NC}"
   exit 1
fi

# 2. Unique ID Handling
UNIQUE_ID=$1
if [[ -z "$UNIQUE_ID" ]]; then
    echo -e "${RED}Error: No Unique ID provided.${NC}"
    echo "Usage: sudo bash install.sh <YOUR_UNIQUE_ID>"
    exit 1
fi

echo -e "Target ID: ${GREEN}$UNIQUE_ID${NC}"

# 3. Create Installation Directory
echo "Creating system directory..."
mkdir -p "$INSTALL_DIR"
chown "$SUDO_USER:$SUDO_USER" "$INSTALL_DIR"

# 4. Install System Dependencies
echo "Step [1/5]: Installing system dependencies (dnsmasq, avahi-daemon, python3)..."
apt-get update
apt-get install -y dnsmasq avahi-daemon python3 python3-pip curl

# 5. Configure mDNS (shieldblock.local)
echo "Step [2/5]: Configuring mDNS (shieldblock.local)..."
hostnamectl set-hostname shieldblock
sed -i 's/raspberrypi/shieldblock/g' /etc/hosts

# 6. Install Python Dependencies
echo "Step [3/5]: Setting up Python environment..."
pip3 install flask flask-cors --break-system-packages || true

# 7. Download Dynamic Configs
echo "Step [4/5]: Fetching custom configuration for ID ${UNIQUE_ID}..."
# In a real scenario, this would be: 
# curl -sSL "${API_BASE_URL}/configs/${UNIQUE_ID}" -o "${INSTALL_DIR}/config.json"
echo '{"id": "'"$UNIQUE_ID"'", "telemetry": "pre-configured", "filters": []}' > "${INSTALL_DIR}/config.json"

# 8. Deploy Backend Files
echo "Step [5/5]: Deploying service files..."
# (Assuming files are in the current directory during install)
cp server.py "$INSTALL_DIR/"
cp "$SERVICE_NAME" /etc/systemd/system/

# 9. Service Activation
echo "Activating ShieldBlock Services..."
systemctl daemon-reload
systemctl enable avahi-daemon
systemctl start avahi-daemon
systemctl enable shieldblock
systemctl restart shieldblock

# 10. Health Check
echo "Finalizing installation..."
sleep 2
if curl -s http://localhost:5000/api/status > /dev/null; then
    echo -e "${GREEN}=== Installation Complete! ===${NC}"
    echo "ShieldBlock is now accessible at http://shieldblock.local"
else
    echo -e "${RED}Warning: Service started but health check failed.${NC}"
    echo "Check logs with: sudo journalctl -u shieldblock"
fi
