import os
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()


def _engine_target():
    """Resolve PostgreSQL target from DATABASE_URL or POSTGRES_* env vars."""
    if database_url := os.getenv("DATABASE_URL"):
        if not database_url.startswith("postgresql"):
            raise RuntimeError("DATABASE_URL must be a postgresql:// connection string.")
        return database_url

    password = os.environ["POSTGRES_PASSWORD"]
    if not password:
        raise RuntimeError(
            "Set POSTGRES_PASSWORD in .env, or provide DATABASE_URL."
        )

    return URL.create(
        drivername="postgresql+psycopg2",
        username=os.getenv("POSTGRES_USER", "shieldblock"),
        password=password,
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "clientInfo"),
    )


engine = create_engine(_engine_target(), pool_size=5, max_overflow=10)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
