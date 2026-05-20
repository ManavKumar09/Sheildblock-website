import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable must be set")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "test"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "test"),
    MAIL_FROM=os.getenv("MAIL_FROM", "test@example.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "ShieldBlock"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

def create_verification_token(email: str):
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {"exp": expire, "sub": email}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=1)  # Access token valid for 1 hour
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_verification_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        return email
    except Exception:
        return None

async def send_verification_email(email: str, token: str):
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    verification_link = f"{FRONTEND_URL}/verify?token={token}"
    html = f"""
    <p>Welcome to ShieldBlock!</p>
    <p>Please click the link below to verify your email address:</p>
    <p><a href="{verification_link}">{verification_link}</a></p>
    """
    
    # We use print here as a fallback mechanism for testing locally without SMTP configured
    print(f"\n=============================")
    print(f"Mock Email to {email}:")
    print(f"Verification Link: {verification_link}")
    print(f"=============================\n")

    if os.getenv("MAIL_USERNAME") != "tester":
        message = MessageSchema(
            subject="ShieldBlock - Verify your Email",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )
        
        fm = FastMail(conf)
        try:
            await fm.send_message(message)
            print(f"Verification email actually sent to {email} via SMTP.")
        except Exception as e:
            print(f"Failed to send email to {email} via SMTP. Error: {e}")
