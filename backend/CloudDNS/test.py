# import psycopg2
# import os
# from dotenv import load_dotenv

# load_dotenv() 

# conn = psycopg2.connect(
#     host="localhost",
#     port=5432,
#     user="shieldblock",
#     password=os.environ["POSTGRES_PASSWORD"],
#     database="clientInfo"
# )

# print("Connected successfully!")

# conn.close()

from datetime import datetime, timedelta
import random
import os

# Import the client initialization function from your analytics file
from analytics import get_clickhouse_client

def generate_dummy_dns_logs(client, days=1, rows=5000):
    """
    Generate realistic dummy DNS logs for ClickHouse historical dashboard testing.
    """
    if not client:
        print("Error: ClickHouse client is not initialized.")
        return

    db_name = os.getenv("CLICKHOUSE_DB", "app")

    domains_allowed = [
        "github.com",
        "api.github.com",
        "cloudflare.com",
        "cdn.jsdelivr.net",
        "google.com",
        "youtube.com",
        "stackoverflow.com",
        "openai.com",
        "fonts.googleapis.com",
        "cdnjs.cloudflare.com"
    ]

    domains_blocked = [
        "ads.google.com",
        "adservice.google.com",
        "doubleclick.net",
        "tracking.facebook.com",
        "analytics.tiktok.com",
        "pixel.adsafeprotected.com",
        "cdn.doubleclick.net",
        "telemetry.microsoft.com",
        "ads.yahoo.com",
        "track.hubspot.com"
    ]

    record_types = ["A", "AAAA", "CNAME", "TXT"]
    blocklists = [
        "EasyPrivacy",
        "OISD",
        "AdGuard DNS",
        "StevenBlack",
        "MalwareDomains"
    ]

    # FIXED: Hashes are now exactly 60 characters to match FixedString(60) in your schema.
    # Otherwise, ClickHouse would pad them with null bytes, breaking queries later.
    config_hashes = [
        "e65d37dc1b5c8b1004572835aed998679e1cb8b285200796954114b92bcd",
        # "b2c3d4e5f6a789012345678901234567890123456789012345678901bcde",
        # "c3d4e5f6a7b890123456789012345678901234567890123456789012cdef",
    ]

    data = []
    now = datetime.now()

    print(f"Generating {rows} rows of analytical data over the past {days} day(s)...")

    for _ in range(rows):
        is_blocked = random.random() < 0.36

        if is_blocked:
            domain = random.choice(domains_blocked)
            response_time = round(random.uniform(1.0, 6.0), 2)
            blocklist = random.choice(blocklists)
        else:
            domain = random.choice(domains_allowed)
            response_time = round(random.uniform(2.0, 12.0), 2)
            blocklist = ""

        record_type = random.choices(
            record_types,
            weights=[58, 24, 12, 6]
        )[0]

        # Distribute timestamps randomly over the specified number of days
        timestamp = now - timedelta(
            minutes=random.randint(0, days * 24 * 60)
        )

        row = [
            timestamp,
            random.choice(config_hashes),
            domain,
            record_type,
            is_blocked,
            response_time,
            blocklist
        ]

        data.append(row)

    print("Inserting data into ClickHouse...")
    
    try:
        client.insert(
            table="dns_logs",
            database=db_name,
            data=data,
            column_names=[
                "timestamp",
                "config_hash",
                "domain",
                "record_type",
                "is_blocked",
                "response_time_ms",
                "blocklist_name"
            ]
        )
        print(f"✅ Inserted {rows} dummy DNS log rows successfully.")
    except Exception as e:
        print(f"❌ Failed to insert data: {e}")

if __name__ == "__main__":
    client = get_clickhouse_client()

    generate_dummy_dns_logs(
        client=client,
        days=1,
        rows=35000
    )
