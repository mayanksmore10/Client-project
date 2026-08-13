from datetime import date, datetime

from beanie import Document
from pydantic import BaseModel, Field


# --- Embedded sub-documents ---


class GuestDetail(BaseModel):
    """Details for one adult guest."""
    full_name: str
    age: int
    gender: str  # "male" / "female" / "other"
    id_proof_type: str  # "aadhar" / "pan" / "passport"
    id_proof_number: str


class RoomSelection(BaseModel):
    """One room type selected by the user during booking."""
    room_type: str  # "single" / "double" / "triple"
    count: int = 1


class PriceBreakdown(BaseModel):
    """Calculated price breakdown for the booking."""
    price_per_person: float = 0
    adult_count: int = 0
    room_charges: float = 0
    subtotal: float = 0
    gst_amount: float = 0
    total: float = 0


# --- Main document ---


class Booking(Document):
    booking_id: str = Field(..., description="Auto-generated ID, e.g. BK-20260812-001")
    user_id: str
    package_id: str
    package_title: str = ""  # denormalized for quick display in history
    destination: str = ""    # denormalized
    travel_date: date
    rooms: list[RoomSelection] = []
    adult_count: int = 1
    guests: list[GuestDetail] = []
    price_breakdown: PriceBreakdown = Field(default_factory=PriceBreakdown)
    payment_method: str | None = None  # "upi" / "card" / "net_banking" / "pay_at_counter"
    status: str = "draft"  # "draft" / "confirmed" / "completed" / "cancelled"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: datetime | None = None
    cancelled_at: datetime | None = None

    class Settings:
        name = "bookings"


# --- Request/response schemas ---


class InitiateBookingRequest(BaseModel):
    package_id: str
    travel_date: date
    rooms: list[RoomSelection]
    adult_count: int = Field(..., ge=1)


class SaveGuestsRequest(BaseModel):
    guests: list[GuestDetail]


class SetPaymentMethodRequest(BaseModel):
    payment_method: str = Field(
        ..., pattern="^(upi|card|net_banking|pay_at_counter)$"
    )


class BookingSummaryResponse(BaseModel):
    """Compact booking card for the history list."""
    booking_id: str
    package_id: str
    package_title: str
    destination: str
    travel_date: date
    adult_count: int
    total: float
    status: str
    created_at: datetime


class BookingDetailResponse(BaseModel):
    """Full booking details."""
    booking_id: str
    user_id: str
    package_id: str
    package_title: str
    destination: str
    travel_date: date
    rooms: list[RoomSelection]
    adult_count: int
    guests: list[GuestDetail]
    price_breakdown: PriceBreakdown
    payment_method: str | None
    status: str
    created_at: datetime
    confirmed_at: datetime | None
    cancelled_at: datetime | None


class BookingHistoryResponse(BaseModel):
    upcoming: list[BookingSummaryResponse] = []
    past: list[BookingSummaryResponse] = []
