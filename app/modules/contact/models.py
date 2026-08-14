from datetime import datetime

from beanie import Document
from pydantic import BaseModel, EmailStr, Field


class ContactEnquiry(Document):
    name: str
    email: str
    phone: str = ""
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "contact_enquiries"


# --- Request schema ---


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = ""
    message: str = Field(..., min_length=10)
