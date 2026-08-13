"""Home page APIs — featured packages, trust stats, destinations, traveler types."""

from fastapi import APIRouter

from app.models.booking import Booking
from app.models.package import TourPackage
from app.models.review import Review

router = APIRouter(tags=["home"])


@router.get("/packages/featured")
async def getFeaturedPackages(limit: int = 6):
    """Return featured/popular packages for the homepage hero section."""
    packages = await TourPackage.find_all(limit=limit).to_list()
    return [p.model_dump(exclude={"embedding"}) for p in packages]


@router.get("/stats")
async def getStats():
    """Trust signals — total guests, tours completed, reviews count."""
    total_bookings = await Booking.find(Booking.status == "completed").count()
    total_reviews = await Review.find_all().count()

    # Approximate guest count from completed bookings
    completed = await Booking.find(Booking.status == "completed").to_list()
    total_guests = sum(b.adult_count for b in completed)

    return {
        "total_guests": total_guests,
        "tours_completed": total_bookings,
        "total_reviews": total_reviews,
    }


@router.get("/destinations")
async def getDestinations():
    """Return distinct destinations for 'Browse by destination' section."""
    packages = await TourPackage.find_all().to_list()
    destinations = list({p.destination for p in packages})
    destinations.sort()
    return destinations


@router.get("/traveler-types")
async def getTravelerTypes():
    """Return available traveler types across all packages."""
    packages = await TourPackage.find_all().to_list()
    types = set()
    for p in packages:
        types.update(p.traveler_type)
    return sorted(types) if types else ["family", "honeymoon", "solo", "senior"]
