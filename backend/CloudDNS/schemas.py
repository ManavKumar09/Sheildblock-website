from typing import Dict
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    is_verified: bool

    class Config:
        from_attributes = True

class CloudConfigCreate(BaseModel):
    filters: Dict[str, bool] # e.g. {"ads": True, "malware": True, "adult": False}

class CloudConfigResponse(BaseModel):
    filters_bitmask: int
    config_hash: str
    dns_url: str

    class Config:
        from_attributes = True
