import os
import secrets
import logging
from datetime import datetime, timedelta, timezone

import bcrypt
from sqlalchemy.orm import Session

from models import User
from schemas import UserCreate

logger = logging.getLogger(__name__)


def verify_password(plain_password: str, hashed_password: str):
    pwd_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


def get_password_hash(password: str):
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode("utf-8")


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()


def is_dns_expired(user: User) -> bool:
    if user.expiry is None:
        return False
    now = datetime.now(timezone.utc)
    expiry = user.expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    return expiry < now


def create_user(db: Session, user: UserCreate):
    try:
        hashed_password = get_password_hash(user.password)
        db_user = User(
            name=user.name,
            email=user.email,
            hashed_password=hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create user: {str(e)}")
        raise


def verify_user(db: Session, email: str):
    try:
        user = get_user_by_email(db, email)
        if not user:
            return None

        user.is_verified = True
        if not user.config_hash:
            user.config_hash = secrets.token_hex(30)

        trial_days = os.getenv("TRIAL_DAYS")
        if trial_days:
            user.expiry = datetime.now(timezone.utc) + timedelta(days=int(trial_days))

        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to verify user: {str(e)}")
        raise
