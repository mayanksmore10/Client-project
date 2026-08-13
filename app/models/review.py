from datetime import datetime

from beanie import Document
from pydantic import BaseModel, Field


class Review(Document):
    user_id: str
    user_name: str = ""  # denormalized for display
    package_id: str
    booking_id: str = ""  # can only review after completing a trip
    rating: int = Field(..., ge=1, le=5)
    comment: str = ""
    photos: list[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reviews"


# --- Request/response schemas ---


class CreateReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = ""
    photos: list[str] = []


class ReviewResponse(BaseModel):
    id: str
    user_name: str
    rating: int
    comment: str
    photos: list[str]
    created_at: datetime
