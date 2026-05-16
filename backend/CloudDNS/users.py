import bcrypt
import time
from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate

def verify_password(plain_password: str, hashed_password: str):
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

def get_password_hash(password: str):
    # bcrypt requires bytes
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name, 
        email=user.email, 
        hashed_password=hashed_password
    )
    db.add(db_user)

    commit_start = time.perf_counter()
    db.commit()
    commit_duration = time.perf_counter() - commit_start

    refresh_start = time.perf_counter()
    db.refresh(db_user)
    refresh_duration = time.perf_counter() - refresh_start

    print(
        f"[CREATE_USER] commit={commit_duration*1000:.2f}ms, refresh={refresh_duration*1000:.2f}ms"
    )
    return db_user

def verify_user(db: Session, email: str):
    user = get_user_by_email(db, email)
    if user:
        user.is_verified = True
        db.commit()
        db.refresh(user)
    return user