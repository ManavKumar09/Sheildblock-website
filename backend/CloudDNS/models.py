import uuid
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    
    # Relationship to cloud configs
    cloud_configs = relationship("CloudDNSConfig", back_populates="owner")

class CloudDNSConfig(Base):
    __tablename__ = "cloud_dns_configs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    profile_name = Column(String)
    filters_bitmask = Column(Integer, default=0)
    config_hash = Column(String(60), unique=True, index=True)
    
    owner = relationship("User", back_populates="cloud_configs")
