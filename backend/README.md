# ShieldBlock Backend

This directory contains the scripts required for the **ShieldBlock** Raspberry Pi setup.

## Files
- `setup.sh`: Main installation script to be run on the Pi.
- `server.py`: Flask-based API for discovery and status reporting.
- `shieldblock.service`: Systemd unit file to ensure the API runs on boot.

## How to use
1. Copy these files to your Raspberry Pi.
2. Run `sudo bash setup.sh`.
3. The Pi will automatically become discoverable at `http://shieldblock.local`.
