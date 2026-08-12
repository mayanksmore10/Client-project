from datetime import datetime

from beanie import Document
from pydantic import BaseModel, EmailStr, Field


class User(Document):
    email: EmailStr
    password_hash: str  # never the plain password — see core/security.py
    full_name: str | None = None
    role: str = "user"  # room for "admin" later, per the design doc's scope note
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


# --- Request/response schemas ---


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    role: str