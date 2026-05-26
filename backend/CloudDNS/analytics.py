import os
import logging
import math
from datetime import datetime
import clickhouse_connect
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Global ClickHouse client instance
_ch_client = None

def get_clickhouse_client():
    """
    Returns the ClickHouse client instance. 
    Initializes the connection if it doesn't exist.
    """
    global _ch_client
    if _ch_client is None:
        try:
            logger.info("Initializing ClickHouse connection...")
            _ch_client = clickhouse_connect.get_client(
                host=os.getenv("CLICKHOUSE_HOST", "172.31.43.17"),
                port=int(os.getenv("CLICKHOUSE_PORT", "8123")),
                username=os.getenv("CLICKHOUSE_USER", "default"),
                password=os.getenv("CLICKHOUSE_PASSWORD", ""),
                database=os.getenv("CLICKHOUSE_DB", "app")
            )
            logger.info("Successfully connected to ClickHouse.")
            
            # Ensure the database and tables exist upon connection
            init_db(_ch_client)
            
        except Exception as e:
            logger.error(f"Failed to connect to ClickHouse: {e}")
            # Set to None so we can gracefully skip logging if DB is down
            _ch_client = None
            
    return _ch_client

def init_db(client):
    """
    Creates the necessary database and tables if they do not exist.
    """
    try:
        db_name = os.getenv("CLICKHOUSE_DB", "app")
        logger.info(f"Ensuring database '{db_name}' exists...")
        client.command(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        
        logger.info("Ensuring table 'dns_logs' exists...")
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {db_name}.dns_logs
        (
            timestamp DateTime DEFAULT now(),          
            config_hash FixedString(60), 

            domain String,               
            record_type String,          

            is_blocked Bool,             
            response_time_ms Float32,    
            blocklist_name String        
        )
        ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (config_hash, timestamp, domain)
        """
        client.command(create_table_query)
        logger.info("ClickHouse 'dns_logs' table initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing ClickHouse schema: {e}")
        raise

def log_dns_query(config_hash: str, domain: str, record_type: str, is_blocked: bool, response_time_ms: float, blocklist_name: str):
    """
    Helper function to insert a new DNS query log into ClickHouse.
    """
    client = get_clickhouse_client()
    if not client:
        logger.warning("ClickHouse client is not available. Skipping log insertion.")
        return
        
    try:
        # We pass the current time for the timestamp
        current_time = datetime.now()
        
        data = [[current_time, config_hash, domain, record_type, is_blocked, response_time_ms, blocklist_name]]
        
        client.insert(
            table='dns_logs',
            data=data,
            column_names=['timestamp', 'config_hash', 'domain', 'record_type', 'is_blocked', 'response_time_ms', 'blocklist_name'],
            database=os.getenv("CLICKHOUSE_DB", "app")
        )
        # Using debug instead of info to avoid spamming the console for every single DNS query
        logger.debug(f"Logged query: {domain} for config: {config_hash[:8]}...")
    except Exception as e:
        logger.error(f"Failed to insert DNS log into ClickHouse: {e}")

# ==========================================
# DASHBOARD ANALYTICS QUERIES
# ==========================================

def get_dashboard_summary(config_hash: str, days: int = 1) -> dict:
    """Fetches total queries, blocked queries, block rate, and period-over-period changes."""
    client = get_clickhouse_client()
    default_resp = {
        "total_queries": 0, "blocked_queries": 0, "block_rate": 0, "avg_response_ms": 0,
        "total_change": 0, "blocked_change": 0, "allowed_change": 0, "response_change": 0
    }
    
    if not client: 
        return default_resp
    
    query = f"""
    SELECT 
        -- Current Period
        countIf(timestamp >= now() - INTERVAL {days} DAY) as current_total,
        sumIf(cast(is_blocked as Int32), timestamp >= now() - INTERVAL {days} DAY) as current_blocked,
        avgIf(response_time_ms, timestamp >= now() - INTERVAL {days} DAY) as current_avg_resp,
        
        -- Previous Period (for delta calculation)
        countIf(timestamp < now() - INTERVAL {days} DAY AND timestamp >= now() - INTERVAL {days*2} DAY) as prev_total,
        sumIf(cast(is_blocked as Int32), timestamp < now() - INTERVAL {days} DAY AND timestamp >= now() - INTERVAL {days*2} DAY) as prev_blocked,
        avgIf(response_time_ms, timestamp < now() - INTERVAL {days} DAY AND timestamp >= now() - INTERVAL {days*2} DAY) as prev_avg_resp
    FROM {os.getenv('CLICKHOUSE_DB', 'app')}.dns_logs
    WHERE config_hash = '{config_hash}' 
      AND timestamp >= now() - INTERVAL {days*2} DAY
    """
    
    try:
        res = client.query(query).result_rows
        if res and len(res) > 0:
            c_total = res[0][0] or 0
            c_blocked = res[0][1] or 0
            c_avg = res[0][2]
            c_avg = 0 if c_avg is None or math.isnan(c_avg) else c_avg
            
            p_total = res[0][3] or 0
            p_blocked = res[0][4] or 0
            p_avg = res[0][5]
            p_avg = 0 if p_avg is None or math.isnan(p_avg) else p_avg

            c_allowed = c_total - c_blocked
            p_allowed = p_total - p_blocked

            def calc_change(current, prev):
                if prev == 0:
                    return 100.0 if current > 0 else 0.0
                return round(((current - prev) / prev) * 100, 1)

            rate = round((c_blocked / c_total) * 100, 2) if c_total > 0 else 0
            
            return {
                "total_queries": c_total,
                "blocked_queries": c_blocked,
                "block_rate": rate,
                "avg_response_ms": round(c_avg, 1),
                "total_change": calc_change(c_total, p_total),
                "blocked_change": calc_change(c_blocked, p_blocked),
                "allowed_change": calc_change(c_allowed, p_allowed),
                "response_change": calc_change(c_avg, p_avg)
            }
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error calculating dashboard summary: {e}")
        
    return default_resp


def get_top_domains(config_hash: str, is_blocked: bool, limit: int = 10, days: int = 1) -> list:
    """Fetches the top N most frequent domains. Can be used for allowed OR blocked domains."""
    client = get_clickhouse_client()
    if not client: 
        return []
    
    blocked_flag = "1" if is_blocked else "0"
    query = f"""
    SELECT domain, count(*) as count
    FROM {os.getenv('CLICKHOUSE_DB', 'app')}.dns_logs
    WHERE config_hash = '{config_hash}'
      AND is_blocked = {blocked_flag}
      AND timestamp >= now() - INTERVAL {days} DAY
    GROUP BY domain
    ORDER BY count DESC
    LIMIT {limit}
    """
    res = client.query(query).result_rows
    return [{"domain": row[0], "count": row[1]} for row in res]


def get_all_domains_stats(config_hash: str, days: int = 7) -> list:
    """Fetches all domains with total queries, blocked queries, and last seen timestamp."""
    client = get_clickhouse_client()
    if not client: 
        return []
    
    query = f"""
    SELECT 
        domain, 
        count(*) as total_queries, 
        sum(cast(is_blocked as Int32)) as blocked_queries,
        max(timestamp) as last_seen
    FROM {os.getenv('CLICKHOUSE_DB', 'app')}.dns_logs
    WHERE config_hash = '{config_hash}'
      AND timestamp >= now() - INTERVAL {days} DAY
    GROUP BY domain
    ORDER BY total_queries DESC
    LIMIT 1000
    """
    res = client.query(query).result_rows
    return [
        {
            "domain": row[0],
            "queries": row[1],
            "blocked": row[2],
            "status": "blocked" if row[2] > 0 and row[2] == row[1] else "allowed",
            "lastSeen": row[3].isoformat() + "Z"
        }
        for row in res
    ]


def get_queries_over_time(config_hash: str, days: int = 1) -> list:
    """Fetches queries grouped by hour, used for drawing the main line/bar chart."""
    client = get_clickhouse_client()
    if not client: 
        return []
    
    # Groups by hour for 1 day, by day for multiple days
    time_func = "toStartOfHour" if days <= 1 else "toStartOfDay"
    query = f"""
    SELECT 
        {time_func}(timestamp) as time_bucket,
        count(*) as total,
        sum(cast(is_blocked as Int32)) as blocked
    FROM {os.getenv('CLICKHOUSE_DB', 'app')}.dns_logs
    WHERE config_hash = '{config_hash}'
      AND timestamp >= now() - INTERVAL {days} DAY
    GROUP BY time_bucket
    ORDER BY time_bucket ASC
    """
    res = client.query(query).result_rows
    return [
        {
            "timestamp": row[0].isoformat() + "Z", 
            "total": row[1], 
            "blocked": row[2]
        } 
        for row in res
    ]


def get_recent_logs(config_hash: str, limit: int = 500, days: int = None) -> list:
    """Fetches the raw most recent queries. Used for the real-time/recent activity table."""
    client = get_clickhouse_client()
    if not client: 
        return []
    
    time_filter = f"AND timestamp >= now() - INTERVAL {days} DAY" if days else ""
    query = f"""
    SELECT timestamp, domain, record_type, is_blocked, blocklist_name, response_time_ms
    FROM {os.getenv('CLICKHOUSE_DB', 'app')}.dns_logs
    WHERE config_hash = '{config_hash}'
      {time_filter}
    ORDER BY timestamp DESC
    LIMIT {limit}
    """
    res = client.query(query).result_rows
    return [
        {
            "timestamp": row[0].isoformat() + "Z",
            "domain": row[1],
            "record_type": row[2],
            "is_blocked": bool(row[3]),
            "blocklist_name": row[4],
            "response_time_ms": row[5]
        }
        for row in res
    ]

def get_query_types_distribution(config_hash: str, days: int = 1) -> list:
    """Fetches the distribution of DNS query types (A, AAAA, CNAME, etc.) for a pie chart."""
    client = get_clickhouse_client()
    if not client: 
        return []
    
    query = f"""
    SELECT record_type, count(*) as count
    FROM {os.getenv('CLICKHOUSE_DB', 'app')}.dns_logs
    WHERE config_hash = '{config_hash}'
      AND timestamp >= now() - INTERVAL {days} DAY
    GROUP BY record_type
    ORDER BY count DESC
    """
    res = client.query(query).result_rows
    return [{"type": row[0], "count": row[1]} for row in res]
