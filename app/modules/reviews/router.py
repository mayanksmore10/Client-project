from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import getCurrentUser
from app.modules.auth.models import User
from app.modules.bookings.models import Booking
from app.modules.reviews.models import CreateReviewRequest, Review, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/{booking_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submitReview(
    booking_id: str,
    request: CreateReviewRequest,
    current_user: User = Depends(getCurrentUser),
):
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your booking")

    if booking.status not in ("confirmed", "completed"):
        raise HTTPException(
            status_code=400,
            detail="You can only review a confirmed or completed booking",
        )

    if booking.travel_date >= date.today():
        raise HTTPException(
            status_code=400,
            detail="You can only review a trip that has already happened",
        )

    existing = await Review.find_one(Review.booking_id == booking_id)
    if existing:
        raise HTTPException(
            status_code=409,
            detail="You have already reviewed this booking",
        )

    review = Review(
        user_id=str(current_user.id),
        user_name=current_user.full_name or current_user.email,
        package_id=booking.package_id,
        booking_id=booking_id,
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


@router.get("/package/{package_id}")
async def getPackageReviews(package_id: str):
    reviews = (
        await Review.find(Review.package_id == package_id)
        .sort("-created_at")
        .to_list()
    )

    review_list = [
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

    avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else None

    return {
        "package_id": package_id,
        "total_reviews": len(review_list),
        "average_rating": avg_rating,
        "reviews": review_list,
    }


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteReview(
    review_id: str,
    current_user: User = Depends(getCurrentUser),
):
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your review")

    await review.delete()
