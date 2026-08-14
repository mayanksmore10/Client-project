from datetime import date, datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import getCurrentUser
from app.modules.bookings.models import (
    Booking,
    BookingDetailResponse,
    BookingHistoryResponse,
    BookingSummaryResponse,
    InitiateBookingRequest,
    PriceBreakdown,
    SaveGuestsRequest,
    SetPaymentMethodRequest,
)
from app.modules.packages.models import TourPackage
from app.modules.auth.models import User

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _generateBookingId() -> str:
    """Generate a unique booking ID like BK-20260812-A1B2."""
    today = date.today().strftime("%Y%m%d")
    short_id = uuid.uuid4().hex[:4].upper()
    return f"BK-{today}-{short_id}"


def _toSummary(b: Booking) -> BookingSummaryResponse:
    return BookingSummaryResponse(
        booking_id=b.booking_id,
        package_id=b.package_id,
        package_title=b.package_title,
        destination=b.destination,
        travel_date=b.travel_date,
        adult_count=b.adult_count,
        total=b.price_breakdown.total,
        status=b.status,
        created_at=b.created_at,
    )


def _toDetail(b: Booking) -> BookingDetailResponse:
    return BookingDetailResponse(
        booking_id=b.booking_id,
        user_id=b.user_id,
        package_id=b.package_id,
        package_title=b.package_title,
        destination=b.destination,
        travel_date=b.travel_date,
        rooms=b.rooms,
        adult_count=b.adult_count,
        guests=b.guests,
        price_breakdown=b.price_breakdown,
        payment_method=b.payment_method,
        status=b.status,
        created_at=b.created_at,
        confirmed_at=b.confirmed_at,
        cancelled_at=b.cancelled_at,
    )


# ──────────────────────────────────────
#  Booking flow
# ──────────────────────────────────────


@router.post("/initiate", status_code=201)
async def initiateBooking(
    request: InitiateBookingRequest,
    current_user: User = Depends(getCurrentUser),
):
    """
    Step 1: Create a draft booking when user clicks 'Book Now'.
    Calculates price breakdown and returns the booking_id for subsequent steps.
    """
    package = await TourPackage.find_one(TourPackage.package_id == request.package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    if request.travel_date not in package.available_dates:
        raise HTTPException(status_code=400, detail="Selected date is not available for this package")

    # Calculate pricing
    room_map = {r.room_type: r for r in package.room_options}
    room_charges = 0.0
    for rs in request.rooms:
        if rs.room_type in room_map:
            room_charges += room_map[rs.room_type].price_per_night * rs.count * package.nights

    person_total = package.price_per_person * request.adult_count
    subtotal = person_total + room_charges
    gst_amount = subtotal * 0.05 if not package.gst_included else 0
    total = subtotal + gst_amount

    booking = Booking(
        booking_id=_generateBookingId(),
        user_id=str(current_user.id),
        package_id=request.package_id,
        package_title=package.title,
        destination=package.destination,
        travel_date=request.travel_date,
        rooms=request.rooms,
        adult_count=request.adult_count,
        price_breakdown=PriceBreakdown(
            price_per_person=package.price_per_person,
            adult_count=request.adult_count,
            room_charges=round(room_charges, 2),
            subtotal=round(subtotal, 2),
            gst_amount=round(gst_amount, 2),
            total=round(total, 2),
        ),
        status="draft",
    )
    await booking.insert()

    return _toDetail(booking)


@router.put("/{booking_id}/guests")
async def saveGuests(
    booking_id: str,
    request: SaveGuestsRequest,
    current_user: User = Depends(getCurrentUser),
):
    """Step 2: Save guest details (name, age, gender, ID proof) for each adult."""
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "draft":
        raise HTTPException(status_code=400, detail="Booking is no longer in draft status")

    if len(request.guests) != booking.adult_count:
        raise HTTPException(
            status_code=400,
            detail=f"Expected {booking.adult_count} guest(s), got {len(request.guests)}",
        )

    booking.guests = request.guests
    await booking.save()
    return _toDetail(booking)


@router.put("/{booking_id}/payment-method")
async def setPaymentMethod(
    booking_id: str,
    request: SetPaymentMethodRequest,
    current_user: User = Depends(getCurrentUser),
):
    """Step 3: Set payment method — upi, card, net_banking, or pay_at_counter."""
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "draft":
        raise HTTPException(status_code=400, detail="Booking is no longer in draft status")

    booking.payment_method = request.payment_method
    await booking.save()
    return _toDetail(booking)


@router.post("/{booking_id}/confirm")
async def confirmBooking(
    booking_id: str,
    current_user: User = Depends(getCurrentUser),
):
    """
    Step 4: Final confirmation.
    Validates all data is filled, changes status from draft → confirmed.
    """
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "draft":
        raise HTTPException(status_code=400, detail="Booking is no longer in draft status")

    # Validate completeness
    if len(booking.guests) != booking.adult_count:
        raise HTTPException(status_code=400, detail="Guest details are incomplete")
    if not booking.payment_method:
        raise HTTPException(status_code=400, detail="Payment method is not set")

    booking.status = "confirmed"
    booking.confirmed_at = datetime.utcnow()
    await booking.save()

    return _toDetail(booking)


# ──────────────────────────────────────
#  View & Cancel
# ──────────────────────────────────────


@router.get("/my")
async def myBookings(
    status: str | None = Query(None, pattern="^(upcoming|past|cancelled|all)$"),
    current_user: User = Depends(getCurrentUser),
):
    """
    Booking history — split into upcoming and past.
    ?status=upcoming | past | cancelled | all (default: returns both upcoming & past).
    """
    user_id = str(current_user.id)
    today = date.today()

    if status == "upcoming":
        bookings = await Booking.find(
            Booking.user_id == user_id,
            Booking.status == "confirmed",
            Booking.travel_date >= today,
        ).sort("-travel_date").to_list()
        return {"upcoming": [_toSummary(b) for b in bookings], "past": []}

    elif status == "past":
        bookings = await Booking.find(
            Booking.user_id == user_id,
            Booking.status.is_in(["completed", "confirmed"]),  # type: ignore
            Booking.travel_date < today,
        ).sort("-travel_date").to_list()
        return {"upcoming": [], "past": [_toSummary(b) for b in bookings]}

    elif status == "cancelled":
        bookings = await Booking.find(
            Booking.user_id == user_id,
            Booking.status == "cancelled",
        ).sort("-travel_date").to_list()
        return {"upcoming": [], "past": [_toSummary(b) for b in bookings]}

    else:
        all_bookings = await Booking.find(
            Booking.user_id == user_id,
            Booking.status != "draft",
        ).sort("-travel_date").to_list()

        upcoming = [_toSummary(b) for b in all_bookings if b.travel_date >= today and b.status == "confirmed"]
        past = [_toSummary(b) for b in all_bookings if b.travel_date < today or b.status in ("completed", "cancelled")]

        return BookingHistoryResponse(upcoming=upcoming, past=past)


@router.get("/{booking_id}")
async def getBooking(
    booking_id: str,
    current_user: User = Depends(getCurrentUser),
):
    """Get full booking details."""
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your booking")
    return _toDetail(booking)


@router.patch("/{booking_id}/cancel")
async def cancelBooking(
    booking_id: str,
    current_user: User = Depends(getCurrentUser),
):
    """Cancel an upcoming booking (only if confirmed and travel date is in the future)."""
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Only confirmed bookings can be cancelled")
    if booking.travel_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot cancel a past booking")

    booking.status = "cancelled"
    booking.cancelled_at = datetime.utcnow()
    await booking.save()

    return _toDetail(booking)
