
from typing import Optional
from beanie import Document
from pydantic import Field


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
            }
        }
