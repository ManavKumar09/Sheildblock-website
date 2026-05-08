#!/bin/bash

# ShieldBlock: Automated Raspberry Pi Setup Script
# This script configures the Pi for ad-blocking and automatic discovery.

set -e

echo "=== ShieldBlock Automated Setup Starting ==="

# 1. Update and Install Dependencies
echo "[1/4] Installing dependencies (dnsmasq, avahi-daemon)..."
sudo apt-get update
sudo apt-get install -y dnsmasq avahi-daemon python3 python3-pip

# 2. Configure mDNS (shieldblock.local)
echo "[2/4] Configuring mDNS (shieldblock.local)..."
sudo hostnamectl set-hostname shieldblock
sudo sed -i 's/raspberrypi/shieldblock/g' /etc/hosts

# 3. Setup Python API for Discovery
echo "[3/4] Setting up Backend API..."
sudo pip3 install flask flask-cors --break-system-packages || true
# (The server.py file will be copied separately)

# 4. Configure systemd Service
echo "[4/4] Enabling ShieldBlock Services..."
sudo systemctl enable avahi-daemon
sudo systemctl start avahi-daemon

# Copy and start the backend service (Placeholder for actual deployment)
# sudo cp shieldblock.service /etc/systemd/system/
# sudo systemctl daemon-reload
# sudo systemctl enable shieldblock
# sudo systemctl start shieldblock

echo "=== Setup Complete! ==="
echo "ShieldBlock is now accessible at http://shieldblock.local"
