from datetime import date, datetime

from beanie import Document
from pymongo import IndexModel, ASCENDING
from pydantic import BaseModel, Field


class GuestDetail(BaseModel):
    name: str = ""
    first_name: str | None = None
    last_name: str | None = None
    age: int | None = None
    gender: str | None = None
    date_of_birth: str | None = None
    phone: str | None = None
    country_code: str | None = "+91"
    email: str | None = None
    nationality: str | None = "India"
    state: str | None = None


class RoomSelection(BaseModel):
    room_type: str
    count: int = 1




class PriceBreakdown(BaseModel):
    price_per_person: float = 0
    adult_count: int = 0
    price_per_child: float = 0
    child_count: int = 0
    room_charges: float = 0
    subtotal: float = 0
    gst_amount: float = 0
    total: float = 0


class Booking(Document):
    booking_id: str = Field(..., description="Auto-generated ID, e.g. BK-20260812-001")
    user_id: str
    package_id: str
    package_title: str = ""
    destination: str = ""
    travel_date: date
    rooms: list[RoomSelection] = []
    adult_count: int = 1
    child_count: int = 0
    guests: list[GuestDetail] = []
    price_breakdown: PriceBreakdown = Field(default_factory=PriceBreakdown)
    paid_amount: float = 0.0
    payment_method: str | None = None
    status: str = "draft"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: datetime | None = None
    cancelled_at: datetime | None = None

    class Settings:
        name = "bookings"
        indexes = [
            IndexModel([("booking_id", ASCENDING)], unique=True),
            IndexModel([("user_id", ASCENDING)]),
        ]


class InitiateBookingRequest(BaseModel):
    package_id: str
    travel_date: date
    rooms: list[RoomSelection]
    adult_count: int = Field(..., ge=1)
    child_count: int = Field(0, ge=0)


class SaveGuestsRequest(BaseModel):
    guests: list[GuestDetail]


class ConfirmBookingRequest(BaseModel):
    paid_amount: float | None = None


class SetPaymentMethodRequest(BaseModel):
    payment_method: str = Field(
        ..., pattern="^(upi|card|net_banking|pay_at_counter)$"
    )


class BookingSummaryResponse(BaseModel):
    booking_id: str
    package_id: str
    package_title: str
    destination: str
    travel_date: date
    adult_count: int
    child_count: int
    total: float
    paid_amount: float = 0.0
    status: str
    created_at: datetime



class BookingDetailResponse(BaseModel):
    booking_id: str
    user_id: str
    package_id: str
    package_title: str
    destination: str
    travel_date: date
    rooms: list[RoomSelection]
    adult_count: int
    child_count: int
    guests: list[GuestDetail]
    price_breakdown: PriceBreakdown
    payment_method: str | None
    status: str
    created_at: datetime
    confirmed_at: datetime | None = None
    cancelled_at: datetime | None = None
    paid_amount: float = 0.0


class BookingHistoryResponse(BaseModel):
    upcoming: list[BookingSummaryResponse] = []
    past: list[BookingSummaryResponse] = []
