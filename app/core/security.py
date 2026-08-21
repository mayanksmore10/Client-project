from datetime import datetime, timedelta, timezone
import jwt
from app.core.config import settings
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError

# --- Password hashing ---

_ph = PasswordHasher()


def hashPassword(plain_password: str) -> str:
    """Hash a plain-text password for storage. Never store the plain password."""
    return _ph.hash(plain_password)


def verifyPassword(plain_password: str, hashed_password: str) -> bool:
    """Verify a submitted password against the stored hash at login time."""
    try:
        return _ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


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


# --- Admin JWT (separate secret — user tokens are invalid here) ---

def createAdminToken() -> str:
    """Create a short-lived token for the single admin account."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "admin",
        "role": "admin",
        "iat": now,
        "exp": now + timedelta(minutes=settings.admin_jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.admin_jwt_secret_key, algorithm=settings.jwt_algorithm)


def decodeAdminToken(token: str) -> dict:
    """Decode and verify an admin token using the separate admin secret."""
    return jwt.decode(token, settings.admin_jwt_secret_key, algorithms=[settings.jwt_algorithm])