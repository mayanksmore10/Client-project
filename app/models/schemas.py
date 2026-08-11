"""
Request / response schemas for the /recommend-packages endpoint.
These are separate from the Beanie document model so the API contract
can evolve independently of the storage schema.
"""

from pydantic import BaseModel, Field, field_validator


class RecommendationRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=3,
        description="Free-text travel requirement from the user (max 30 words)",
        examples=[
            "I want a 3 days 2 nights Mumbai to Goa trip, "
            "around ₹10,000 per person, including GST."
        ],
    )

    @field_validator("query")
    @classmethod
    def max_words(cls, v: str) -> str:
        if len(v.split()) > 30:
            raise ValueError("Query must not exceed 30 words")
        return v
    top_k: int | None = Field(
        default=None, description="Override the number of packages to return"
    )


class PackageCard(BaseModel):
    package_id: str
    title: str
    destination: str
    days: int
    nights: int
    price_per_person: float
    gst_included: bool
    inclusions: list[str]
    itinerary_summary: str
    package_url: str
    match_reason: str | None = None
    score: float | None = None


class RecommendationResponse(BaseModel):
    packages: list[PackageCard]
    query_understood_as: dict | None = None
