
from datetime import date
from typing import Optional
from beanie import Document
from pydantic import BaseModel, Field


class RoomOption(BaseModel):
    """A room type offered for a package (e.g. Single, Double, Triple)."""
    room_type: str  # "single" / "double" / "triple"
    label: str = ""  # Human-readable, e.g. "Deluxe Double Room"
    price_per_night: float = 0
    max_occupancy: int = 2
    available_count: int = 10  # how many of this room type are available


class TourPackage(Document):
    package_id: str = Field(..., description="Unique human-readable package ID")
    title: str
    from_: str = Field(..., alias="from")
    destination: str
    days: int
    nights: int
    price_per_person: float
    gst_included: bool
    inclusions: list[str] = []
    exclusions: list[str] = []
    itinerary: list[str] = []
    package_url: str
    embedding: Optional[list[float]] = None

    # --- New fields ---
    traveler_type: list[str] = []        # e.g. ["family", "honeymoon", "solo", "senior"]
    images: list[str] = []               # Photo URLs
    available_dates: list[date] = []     # Dates when the tour runs
    room_options: list[RoomOption] = []   # Room types with pricing
    highlights: list[str] = []           # Short highlights for card view

    class Settings:
        name = "packages"


    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "package_id": "GOA_3D2N_001",
                "title": "Mumbai to Goa 3D/2N Package",
                "from": "Mumbai",
                "destination": "Goa",
                "days": 3,
                "nights": 2,
                "price_per_person": 10000,
                "gst_included": True,
                "inclusions": ["Accommodation", "Breakfast", "Transfers"],
                "exclusions": ["Personal expenses"],
                "itinerary": [
                    "Day 1: Mumbai to Goa and hotel check-in",
                    "Day 2: Goa sightseeing",
                    "Day 3: Checkout and return",
                ],
                "package_url": "/packages/GOA_3D2N_001",
                "traveler_type": ["family", "honeymoon"],
                "images": ["/images/goa1.jpg"],
                "available_dates": ["2026-09-15", "2026-09-22"],
                "room_options": [
                    {"room_type": "double", "label": "Deluxe Double", "price_per_night": 3000, "max_occupancy": 2, "available_count": 5}
                ],
                "highlights": ["Beach activities", "Water sports"],
            }
        }

