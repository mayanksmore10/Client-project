from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# --- Password hashing ---

_pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hashPassword(plain_password: str) -> str:
    """Hash a plain-text password for storage. Never store the plain password."""
    return _pwd_context.hash(plain_password)


def verifyPassword(plain_password: str, hashed_password: str) -> bool:
    """Verify a submitted password against the stored hash at login time."""
    return _pwd_context.verify(plain_password, hashed_password)


# --- JWT ---
def createAccessToken(user_id: str, role: str = "user") -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decodeAccessToken(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])