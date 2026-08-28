from datetime import date, datetime

from beanie import Document
from pymongo import IndexModel, ASCENDING
from pydantic import BaseModel, EmailStr, Field


class User(Document):
    email: EmailStr
    password_hash: str
    full_name: str | None = None
    phone: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None
    profile_photo_url: str | None = None
    role: str = "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("email", ASCENDING)], unique=True),
        ]


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
    profile_photo_url: str | None = None



class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)