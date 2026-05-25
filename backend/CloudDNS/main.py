# import os
import asyncio
import secrets
import cache
from fastapi import FastAPI, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from db import SessionLocal, engine, Base, get_db
import models
import schemas
import users
from email_utils import create_verification_token, send_verification_email, decode_verification_token, create_access_token
import analytics
import redis.asyncio as aioredis
import json
# Create the database tables
Base.metadata.create_all(bind=engine)

# Development mode flag: auto-seed a verified dev user and skip email verification during development.
# DEV_MODE = os.getenv("DEV_MODE", "false").lower() in ("1", "true", "yes")
# DEV_USER_EMAIL = os.getenv("DEV_USER_EMAIL", "dev@shieldblock.local")
# DEV_USER_PASSWORD = os.getenv("DEV_USER_PASSWORD", "devpass")
# DEV_USER_NAME = os.getenv("DEV_USER_NAME", "Developer")


# def ensure_dev_user():
#     if not DEV_MODE:
#         return

#     with SessionLocal() as db:
#         dev_user = users.get_user_by_email(db, email=DEV_USER_EMAIL)
#         if not dev_user:
#             dev_user_payload = schemas.UserCreate(
#                 name=DEV_USER_NAME,
#                 email=DEV_USER_EMAIL,
#                 password=DEV_USER_PASSWORD,
#             )
#             dev_user = users.create_user(db=db, user=dev_user_payload)

#         if not dev_user.is_verified:
#             users.verify_user(db, DEV_USER_EMAIL)


# ensure_dev_user()

# Setup Rate Limiter (limits based on User's IP address)
# limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="ShieldBlock API")

# Add Rate Limiter to app state
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS to allow the React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Add Vite and standard React ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.UserResponse)
# @limiter.limit("5/minute") # Max 5 signups per minute per IP
async def register(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db), background_tasks: BackgroundTasks = None):
    db_user = users.get_user_by_email(db, email=user.email)
    if db_user:
        if db_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            token = create_verification_token(db_user.email)
            background_tasks.add_task(send_verification_email, db_user.email, token)
            return db_user
    
    new_user = users.create_user(db=db, user=user)

    # if DEV_MODE:
    #     users.verify_user(db, new_user.email)
    #     return new_user

    token = create_verification_token(new_user.email)
    background_tasks.add_task(send_verification_email, new_user.email, token)
    
    return new_user

@app.get("/verify/{token}")
# @limiter.limit("10/minute")
async def verify_email(request: Request, token: str, db: Session = Depends(get_db)):
    email = decode_verification_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    db_user = users.get_user_by_email(db, email=email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not db_user.is_verified:
        users.verify_user(db, email)
        
    access_token = create_access_token(data={"sub": db_user.id})
    return {
        "message": "Email successfully verified!",
        "access_token": access_token,
        "email": email,
        "name": db_user.name
    }

@app.get("/check-verification")
async def check_verification(email: str, db: Session = Depends(get_db)):
    db_user = users.get_user_by_email(db, email=email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"is_verified": db_user.is_verified}

@app.post("/login", response_model=schemas.Token)
# @limiter.limit("10/minute") # Max 10 login attempts per minute per IP to prevent brute forcing
async def login(request: Request, user_credentials: schemas.UserLogin, db: Session = Depends(get_db), background_tasks: BackgroundTasks = None):
    # 1. Find user by email
    user = users.get_user_by_email(db, email=user_credentials.email)
    
    # 2. Check if user exists and password is correct
    if not user or not users.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
    
    # 3. Check if user is verified
    if not user.is_verified:
        token = create_verification_token(user.email)
        asyncio.create_task(send_verification_email(user.email, token))
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. A new link has been sent."
        )
        
    # 4. Generate JWT Token
    access_token = create_access_token(data={"sub": user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user_id(token: str = Depends(oauth2_scheme)):
    from email_utils import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

FILTER_MAPPING = {
    "ads": 1,        # 000001
    "malware": 2,    # 000010
    "adult": 4,      # 000100
    "tracking": 8,   # 001000
    "phishing": 16,  # 010000
    "social": 32     # 100000
}

@app.post("/api/cloud-config", response_model=schemas.CloudConfigResponse)
async def create_cloud_config(
    config: schemas.CloudConfigCreate, 
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Calculate bitmask based on selected filters
    bitmask = 0
    for f_name, is_enabled in config.filters.items():
        if is_enabled and f_name in FILTER_MAPPING:
            bitmask |= FILTER_MAPPING[f_name]
            
    # Generate 60-character secure hash (30 bytes -> 60 hex characters)
    config_hash = secrets.token_hex(30)
    
    # Save the configuration to Valkey using cache utility
    cache.set_config_bitmask(config_hash, bitmask)
    
    # Update the user's config_hash in Postgres
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.config_hash = config_hash

    db.commit()
    
    # Return response including the full DNS URL
    response_data = schemas.CloudConfigResponse(
        filters_bitmask=bitmask,
        config_hash=config_hash,
        dns_url=f"{config_hash}.dns.shieldblock.in"
    )
    
    return response_data

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.config_hash:
        raise HTTPException(status_code=400, detail="No DNS configuration found for this user.")
        
    config_hash = user.config_hash
    # config_hash = "a1b2c3d4e5f678901234567890123456789012345678901234567890abcd"
    
    return {
        "summary": analytics.get_dashboard_summary(config_hash),
        "top_blocked": analytics.get_top_domains(config_hash, is_blocked=True, limit=10),
        "top_allowed": analytics.get_top_domains(config_hash, is_blocked=False, limit=10),
        "chart_data": analytics.get_queries_over_time(config_hash),
        "query_types": analytics.get_query_types_distribution(config_hash),
        "recent_logs": analytics.get_recent_logs(config_hash, limit=50)
    }

# The channel name where the DNS server will publish
DNS_LOGS_CHANNEL = "live_dns_logs"

def parse_binary_dns_log(payload: bytes):
    if len(payload) < 63:
        return None
    try:
        config_hash = payload[0:60].decode('utf-8')
        is_blocked = bool(payload[60])
        # Assuming big-endian for the 2-byte domain length. If your friend uses little-endian, change to 'little'
        domain_length = int.from_bytes(payload[61:63], byteorder='big') 
        domain = payload[63:63+domain_length].decode('utf-8')
        return {
            "config_hash": config_hash,
            "is_blocked": is_blocked,
            "domain": domain
        }
    except Exception as e:
        print(f"Error parsing binary payload: {e}")
        return None

@app.get("/api/dashboard/live-stream")
async def live_stream_logs(
    request: Request,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
    ):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.config_hash:
        raise HTTPException(status_code=400, detail="No DNS configuration found for this user.")
        
    target_config_hash = user.config_hash

    async def event_generator():
        # Create an async redis connection for this SSE stream
        async_redis = aioredis.Redis(host='localhost', port=6379)
        pubsub = async_redis.pubsub()
        await pubsub.subscribe(DNS_LOGS_CHANNEL)
        
        try:
            while True:
                # Disconnect if client closes the browser/connection
                if await request.is_disconnected():
                    break
                    
                # timeout=1.0 allows the loop to check for disconnects every second
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message is not None:
                    # Message data is bytes
                    payload = message['data']
                    parsed = parse_binary_dns_log(payload)
                    
                    # Only send to frontend if the config_hash matches the current user
                    if parsed and parsed['config_hash'] == target_config_hash:
                        # Print to terminal for debugging
                        print(f"[LIVE STREAM DEBUG] Emitting for user: {parsed['domain']} (Blocked: {parsed['is_blocked']})")
                        
                        # Format as SSE event
                        data = json.dumps({
                            "domain": parsed["domain"],
                            "is_blocked": parsed["is_blocked"]
                        })
                        yield f"data: {data}\n\n"
        finally:
            await pubsub.unsubscribe(DNS_LOGS_CHANNEL)
            await pubsub.close()
            await async_redis.aclose()

    return StreamingResponse(event_generator(), media_type="text/event-stream")
