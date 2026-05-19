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
    config_hash = Column(String(60), ForeignKey("cloud_dns_configs.config_hash"))
    
    # Relationship to cloud config
    cloud_config = relationship("CloudDNSConfig")

class CloudDNSConfig(Base):
    __tablename__ = "cloud_dns_configs"

    config_hash = Column(String(60), primary_key=True, index=True)
    filters_bitmask = Column(Integer, default=0)
