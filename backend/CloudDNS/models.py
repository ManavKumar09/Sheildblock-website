import uuid
from sqlalchemy import Column, String, Boolean, DateTime
from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    config_hash = Column(String(60), unique=True, index=True, nullable=True)
    expiry = Column(DateTime(timezone=True), nullable=True)
    is_verified = Column(Boolean, default=False)
