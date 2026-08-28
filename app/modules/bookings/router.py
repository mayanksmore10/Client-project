from datetime import date, datetime, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import getCurrentUser
from app.modules.bookings.models import (
    Booking,
    BookingDetailResponse,
    BookingHistoryResponse,
    BookingSummaryResponse,
    ConfirmBookingRequest,
    InitiateBookingRequest,
    PriceBreakdown,
    SaveGuestsRequest,
    SetPaymentMethodRequest,
)
from app.modules.packages.models import TourPackage
from app.modules.auth.models import User

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _generateBookingId() -> str:
    today = date.today().strftime("%Y%m%d")
    short_id = uuid.uuid4().hex[:4].upper()
    return f"BK-{today}-{short_id}"


def _toSummary(b: Booking) -> BookingSummaryResponse:
    calc_paid = b.paid_amount if (b.paid_amount and b.paid_amount > 0) else (b.price_breakdown.total / 2 if b.status == "token_paid" else b.price_breakdown.total)
    return BookingSummaryResponse(
        booking_id=b.booking_id,
        package_id=b.package_id,
        package_title=b.package_title,
        destination=b.destination,
        travel_date=b.travel_date,
        adult_count=b.adult_count,
        child_count=b.child_count,
        total=b.price_breakdown.total,
        paid_amount=calc_paid,
        status=b.status,
        created_at=b.created_at,
    )


def _toDetail(b: Booking) -> BookingDetailResponse:
    calc_paid = b.paid_amount if (b.paid_amount and b.paid_amount > 0) else (b.price_breakdown.total / 2 if b.status == "token_paid" else b.price_breakdown.total)
    return BookingDetailResponse(
        booking_id=b.booking_id,
        user_id=b.user_id,
        package_id=b.package_id,
        package_title=b.package_title,
        destination=b.destination,
        travel_date=b.travel_date,
        rooms=b.rooms,
        adult_count=b.adult_count,
        child_count=b.child_count,
        guests=b.guests,
        price_breakdown=b.price_breakdown,
        payment_method=b.payment_method,
        status=b.status,
        created_at=b.created_at,
        confirmed_at=b.confirmed_at,
        cancelled_at=b.cancelled_at,
        paid_amount=calc_paid,
    )



@router.post("/initiate", status_code=201)
async def initiateBooking(
    request: InitiateBookingRequest,
    current_user: User = Depends(getCurrentUser),
):
    package = await TourPackage.find_one(TourPackage.package_id == request.package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    if request.travel_date not in package.available_dates:
        raise HTTPException(status_code=400, detail="Selected date is not available for this package")

    child_count = request.child_count
    price_per_child = package.price_per_child or 0.0
    if child_count > 0 and not package.price_per_child:
        raise HTTPException(
            status_code=400,
            detail="This package does not support children pricing"
        )

    room_map = {r.room_type: r for r in package.room_options}
    room_charges = 0.0
    for rs in request.rooms:
        if rs.room_type in room_map:
            room_charges += room_map[rs.room_type].price_per_night * rs.count * package.nights

    adult_total = package.price_per_person * request.adult_count
    child_total = price_per_child * child_count
    person_total = adult_total + child_total
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
        child_count=child_count,
        price_breakdown=PriceBreakdown(
            price_per_person=package.price_per_person,
            adult_count=request.adult_count,
            price_per_child=price_per_child,
            child_count=child_count,
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

    for guest in request.guests:
        if not guest.name and (guest.first_name or guest.last_name):
            guest.name = f"{guest.first_name or ''} {guest.last_name or ''}".strip()

    booking.guests = request.guests
    await booking.save()
    return _toDetail(booking)


@router.put("/{booking_id}/payment-method")
async def setPaymentMethod(
    booking_id: str,
    request: SetPaymentMethodRequest,
    current_user: User = Depends(getCurrentUser),
):
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Payment method can only be set after booking is confirmed")

    booking.payment_method = request.payment_method
    await booking.save()
    return _toDetail(booking)


@router.post("/{booking_id}/confirm")
async def confirmBooking(
    booking_id: str,
    body: ConfirmBookingRequest | None = None,
    current_user: User = Depends(getCurrentUser),
):
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking.status != "draft":
        raise HTTPException(status_code=400, detail="Booking is no longer in draft status")

    if len(booking.guests) != booking.adult_count:
        raise HTTPException(status_code=400, detail="Guest details are incomplete")

    if body and body.paid_amount:
        booking.paid_amount = body.paid_amount
    else:
        booking.paid_amount = booking.price_breakdown.total

    booking.status = "confirmed"
    booking.confirmed_at = datetime.now(timezone.utc)
    await booking.save()

    return _toDetail(booking)



@router.get("/my")
async def myBookings(
    status: str | None = Query(None, pattern="^(upcoming|past|cancelled|all)$"),
    current_user: User = Depends(getCurrentUser),
):
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
    booking.cancelled_at = datetime.now(timezone.utc)
    await booking.save()

    return _toDetail(booking)
