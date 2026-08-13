"""Tour packages — listing, search/filter, detail, available dates, rooms, pricing, reviews."""

from datetime import date

from beanie.operators import In
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import getCurrentUser
from app.models.package import TourPackage
from app.models.review import CreateReviewRequest, Review, ReviewResponse
from app.models.user import User

router = APIRouter(prefix="/packages", tags=["packages"])


# ──────────────────────────────────────
#  Basic listing & detail
# ──────────────────────────────────────


@router.get("")
async def listPackages(limit: int = 20):
    """List packages (no semantic search) — useful for debugging / admin views."""
    packages = await TourPackage.find_all(limit=limit).to_list()
    return [p.model_dump(exclude={"embedding"}) for p in packages]


@router.get("/search")
async def searchPackages(
    destination: str | None = None,
    budget_min: float | None = None,
    budget_max: float | None = None,
    days: int | None = None,
    traveler_type: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    """Filter packages by destination, budget, days, and traveler type. Paginated."""
    query = {}

    if destination:
        query["destination"] = {"$regex": destination, "$options": "i"}
    if budget_min is not None:
        query.setdefault("price_per_person", {})["$gte"] = budget_min
    if budget_max is not None:
        query.setdefault("price_per_person", {})["$lte"] = budget_max
    if days is not None:
        query["days"] = days
    if traveler_type:
        query["traveler_type"] = traveler_type

    skip = (page - 1) * page_size

    total = await TourPackage.find(query).count()
    packages = await TourPackage.find(query).skip(skip).limit(page_size).to_list()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "packages": [p.model_dump(exclude={"embedding"}) for p in packages],
    }


@router.get("/by-destination/{destination}")
async def getByDestination(destination: str, limit: int = 20):
    """Browse all packages for a specific destination."""
    packages = await TourPackage.find(
        {"destination": {"$regex": f"^{destination}$", "$options": "i"}}
    ).limit(limit).to_list()
    return [p.model_dump(exclude={"embedding"}) for p in packages]


@router.get("/by-type/{traveler_type}")
async def getByTravelerType(traveler_type: str, limit: int = 20):
    """Browse packages tagged for a specific traveler type."""
    packages = await TourPackage.find(
        {"traveler_type": traveler_type}
    ).limit(limit).to_list()
    return [p.model_dump(exclude={"embedding"}) for p in packages]


# ──────────────────────────────────────
#  Package detail page helpers
# ──────────────────────────────────────


@router.get("/{package_id}")
async def getPackage(package_id: str):
    """Fetch a single package by ID — used by the 'View Package' redirect flow."""
    package = await TourPackage.find_one(TourPackage.package_id == package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package.model_dump(exclude={"embedding"})


@router.get("/{package_id}/available-dates")
async def getAvailableDates(package_id: str):
    """Return available travel dates for this package."""
    package = await TourPackage.find_one(TourPackage.package_id == package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    # Filter out past dates
    today = date.today()
    future_dates = [d for d in package.available_dates if d >= today]
    return {"package_id": package_id, "available_dates": sorted(future_dates)}


@router.get("/{package_id}/rooms")
async def getRoomOptions(package_id: str, travel_date: date | None = None):
    """After user selects a date, return available room types with pricing."""
    package = await TourPackage.find_one(TourPackage.package_id == package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    if travel_date and travel_date not in package.available_dates:
        raise HTTPException(status_code=400, detail="Selected date is not available")

    return {
        "package_id": package_id,
        "travel_date": travel_date,
        "room_options": [r.model_dump() for r in package.room_options],
    }




# ──────────────────────────────────────
#  Reviews
# ──────────────────────────────────────


@router.get("/{package_id}/reviews")
async def getReviews(package_id: str, limit: int = 20):
    """Fetch review cards for a specific package."""
    reviews = await Review.find(
        Review.package_id == package_id
    ).sort("-created_at").limit(limit).to_list()

    return [
        ReviewResponse(
            id=str(r.id),
            user_name=r.user_name,
            rating=r.rating,
            comment=r.comment,
            photos=r.photos,
            created_at=r.created_at,
        )
        for r in reviews
    ]


@router.post("/{package_id}/reviews", status_code=201)
async def createReview(
    package_id: str,
    request: CreateReviewRequest,
    current_user: User = Depends(getCurrentUser),
):
    """Authenticated user submits a review for a package."""
    # Verify package exists
    package = await TourPackage.find_one(TourPackage.package_id == package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    review = Review(
        user_id=str(current_user.id),
        user_name=current_user.full_name or current_user.email,
        package_id=package_id,
        rating=request.rating,
        comment=request.comment,
        photos=request.photos,
    )
    await review.insert()

    return ReviewResponse(
        id=str(review.id),
        user_name=review.user_name,
        rating=review.rating,
        comment=review.comment,
        photos=review.photos,
        created_at=review.created_at,
    )
