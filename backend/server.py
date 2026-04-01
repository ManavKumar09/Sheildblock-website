import os
import json
import socket
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS so the website (e.g., localhost or shieldblock.com) can reach us
CORS(app)

CONFIG_PATH = "/opt/shieldblock/config.json"

def load_config():
    """Load configuration from the opt directory."""
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, 'r') as f:
                return json.load(f)
        except Exception as e:
            return {"error": f"Failed to load config: {str(e)}"}
    return {"status": "default", "telemetry": "unknown"}

@app.route('/api/status', methods=['GET'])
def get_status():
    """
    Status endpoint for the ShieldBlock frontend to detect the Pi.
    """
    config = load_config()
    return jsonify({
        "status": "online",
        "hostname": socket.gethostname(),
        "version": "1.0.0",
        "adblocker": "running",
        "config": config
    })

if __name__ == '__main__':
    # Listen on all interfaces so the LAN can reach us
    app.run(host='0.0.0.0', port=5000)
