import secrets
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from db import engine, Base, get_db
import models
import schemas
import users
from email_utils import create_verification_token, send_verification_email, decode_verification_token, create_access_token

# Create the database tables
Base.metadata.create_all(bind=engine)

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
async def register(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = users.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = users.create_user(db=db, user=user)
    
    token = create_verification_token(new_user.email)
    await send_verification_email(new_user.email, token)
    
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

@app.post("/login", response_model=schemas.Token)
# @limiter.limit("10/minute") # Max 10 login attempts per minute per IP to prevent brute forcing
async def login(request: Request, user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in."
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
    
    new_config = models.CloudDNSConfig(
        user_id=user_id,
        profile_name=config.profile_name,
        filters_bitmask=bitmask,
        config_hash=config_hash
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    
    # Return response including the full DNS URL
    response_data = schemas.CloudConfigResponse(
        id=new_config.id,
        profile_name=new_config.profile_name,
        filters_bitmask=new_config.filters_bitmask,
        config_hash=new_config.config_hash,
        dns_url=f"{config_hash}.shieldblock.in"
    )
    
    return response_data
