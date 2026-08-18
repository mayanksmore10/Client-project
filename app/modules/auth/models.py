from datetime import date, datetime, timedelta

from beanie import Document
from pydantic import BaseModel, EmailStr, Field


class User(Document):
    email: EmailStr
    password_hash: str  # never the plain password — see core/security.py
    full_name: str | None = None
    phone: str | None = None
    gender: str | None = None  # "male" / "female" / "other"
    date_of_birth: date | None = None
    profile_photo_url: str | None = None
    role: str = "user"  # room for "admin" later, per the design doc's scope note
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # --- Password reset ---
    password_reset_token: str | None = None
    password_reset_expires: datetime | None = None

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
    phone: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None
    profile_photo_url: str | None = None
    role: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)