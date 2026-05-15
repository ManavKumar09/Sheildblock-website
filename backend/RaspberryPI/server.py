import os
import json
import socket
import psycopg2
import valkey
from flask import Flask, jsonify, request
from flask_cors import CORS

# Import the generated protobuf classes

try:
    from proto import filters_pb2
except ImportError:
    # Fallback or placeholder if generation is still pending
    filters_pb2 = None

app = Flask(__name__)
CORS(app)

# --- Configuration ---
VALKEY_HOST = os.getenv('VALKEY_HOST', 'localhost')
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
DB_NAME = "shieldblock"
DB_USER = "shieldadmin"
DB_PASS = "shieldpassword"

# --- Database & Cache Clients ---
try:
    cache = valkey.Valkey(host=VALKEY_HOST, port=6379, decode_responses=True)
    db_conn = psycopg2.connect(
        host=POSTGRES_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    db_conn.autocommit = True
except Exception as e:
    print(f"Warning: Could not connect to DB/Cache: {e}")
    cache = None
    db_conn = None

def init_db():
    if not db_conn: return
    with db_conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS user_filters (
                user_id UUID REFERENCES users(id),
                filter_id INTEGER,
                enabled BOOLEAN,
                PRIMARY KEY (user_id, filter_id)
            );
        """)

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "online",
        "cloud_sync": cache is not None,
        "database": db_conn is not None,
        "hostname": socket.gethostname()
    }), 200

@app.route('/api/filters/update', methods=['POST'])
def update_filters():
    """
    Binary transmission endpoint.
    Expects Content-Type: application/octet-stream (Protobuf)
    """
    if not filters_pb2:
        return jsonify({"error": "Protobuf modules not loaded"}), 500

    try:
        # 1. Capture Client IP for "Linked IP" authentication
        client_ip = request.remote_addr
        
        # 2. Decode Binary Protobuf Message
        data = request.get_data()
        request_msg = filters_pb2.FilterUpdateRequest()
        request_msg.ParseFromString(data)
        
        user_id = request_msg.user_id
        filters = request_msg.filters

        # 3. Store in PostgreSQL (Persistence)
        if db_conn:
            with db_conn.cursor() as cur:
                for f in filters:
                    cur.execute("""
                        INSERT INTO user_filters (user_id, filter_id, enabled)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (user_id, filter_id) DO UPDATE SET enabled = EXCLUDED.enabled
                    """, (user_id, f.id, f.enabled))

        # 4. Update Valkey (Fast DNS Lookup)
        if cache:
            # Map IP -> UserID (Linked IP)
            cache.set(f"ip:{client_ip}", user_id, ex=86400) # Expiry 24h
            
            # Update Active Filters Cache
            filter_data = {str(f.id): f.enabled for f in filters}
            cache.hset(f"user:{user_id}:filters", mapping=filter_data)

        return jsonify({
            "status": "success",
            "linked_ip": client_ip,
            "user_id": user_id
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
