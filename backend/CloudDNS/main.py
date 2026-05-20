from contextlib import asynccontextmanager
import logging
import os

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.extension import _rate_limit_exceeded_handler

import cache
import schemas
import users
from db import Base, engine, get_db
from email_utils import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    create_verification_token,
    decode_verification_token,
    send_verification_email,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

FILTER_MAPPING = {
    "ads": 1,
    "malware": 2,
    "adult": 4,
    "tracking": 8,
    "phishing": 16,
    "social": 32,
}

DEFAULT_BITMASK = sum(FILTER_MAPPING.values())
DNS_HOST_SUFFIX = "dns.shieldblock.in"


@asynccontextmanager
async def lifespan(app: FastAPI):
    cache.get_valkey()
    yield


app = FastAPI(title="ShieldBlock API", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

limiter = Limiter(key_func=get_remote_address)

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        return user_id
    except JWTError as e:
        logger.error(f"JWT decode failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )


def filters_to_bitmask(filters: dict[str, bool]) -> int:
    if not filters:
        return DEFAULT_BITMASK
    bitmask = 0
    for name, enabled in filters.items():
        if enabled and name in FILTER_MAPPING:
            bitmask |= FILTER_MAPPING[name]
    return bitmask


def dns_url(config_hash: str) -> str:
    return f"{config_hash}.{DNS_HOST_SUFFIX}"


def provision_valkey_if_active(user) -> None:
    if user.config_hash and not users.is_dns_expired(user):
        cache.set_config_bitmask(user.config_hash, DEFAULT_BITMASK)

@limiter.limit("10/minute")
@app.post("/register", response_model=schemas.UserResponse)
async def register(
    request: Request,
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None,
):
    db_user = users.get_user_by_email(db, email=user.email)
    if db_user:
        logger.warning(f"Duplicate registration attempt: {user.email}")

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = users.create_user(db=db, user=user)
    logger.info(f"User registered: {new_user.email}")
    token = create_verification_token(new_user.email)
    background_tasks.add_task(send_verification_email, new_user.email, token)
    return new_user

@limiter.limit("10/minute")
@app.get("/verify/{token}")
async def verify_email(request: Request, token: str, db: Session = Depends(get_db)):
    email = decode_verification_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    db_user = users.get_user_by_email(db, email=email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not db_user.is_verified:
        db_user = users.verify_user(db, email)
    else:
        db.refresh(db_user)

    provision_valkey_if_active(db_user)

    access_token = create_access_token(data={"sub": db_user.id})
    return {
        "message": "Email successfully verified!",
        "access_token": access_token,
        "email": email,
        "name": db_user.name,
        "config_hash": db_user.config_hash,
        "dns_url": dns_url(db_user.config_hash) if db_user.config_hash else None,
    }

@limiter.limit("10/minute")
@app.post("/login", response_model=schemas.Token)
async def login(
    request: Request,
    user_credentials: schemas.UserLogin,
    db: Session = Depends(get_db),
):
    user = users.get_user_by_email(db, email=user_credentials.email)

    if not user or not users.verify_password(
        user_credentials.password,
        user.hashed_password
    ):

        logger.warning(
            f"Invalid login attempt: {user_credentials.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in.",
        )

    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/cloud-config", response_model=schemas.CloudConfigResponse)
async def create_cloud_config(
    config: schemas.CloudConfigCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # Validate filter names
    invalid_filters = set(config.filters.keys()) - set(FILTER_MAPPING.keys())
    if invalid_filters:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid filter names: {', '.join(invalid_filters)}. Valid filters: {', '.join(FILTER_MAPPING.keys())}",
        )

    user = users.get_user_by_id(db, user_id)
    if not user or not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before updating DNS config.",
        )
    if not user.config_hash:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="DNS identity not provisioned.",
        )
    if users.is_dns_expired(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="DNS subscription expired",
        )

    bitmask = filters_to_bitmask(config.filters)
    success = cache.set_config_bitmask(user.config_hash, bitmask)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update DNS configuration",
        )

    return schemas.CloudConfigResponse(
        id=user.id,
        profile_name=config.profile_name,
        filters_bitmask=bitmask,
        config_hash=user.config_hash,
        dns_url=dns_url(user.config_hash),
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {str(exc)}")

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
