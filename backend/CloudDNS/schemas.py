from typing import Dict

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        if not any(c.isupper() for c in value):
            raise ValueError("Password must contain an uppercase letter")

        if not any(c.islower() for c in value):
            raise ValueError("Password must contain a lowercase letter")

        if not any(c.isdigit() for c in value):
            raise ValueError("Password must contain a number")

        return value

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
    profile_name: str = Field(min_length=1, max_length=50)
    filters: Dict[str, bool] = Field(default_factory=dict)

class CloudConfigResponse(BaseModel):
    filters_bitmask: int
    config_hash: str
    dns_url: str

    class Config:
        from_attributes = True
