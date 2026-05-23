import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="shieldblock",
    password="6Rswt7dfXs3BF9I2KymwAoqlSX2xHqwfOkPje27eWo8=",
    database="clientInfo"
)

print("Connected successfully!")

conn.close()