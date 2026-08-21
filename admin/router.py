from datetime import date, datetime
from typing import Optional

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, EmailStr, Field

from app.core.config import settings
from app.core.dependencies import requireAdmin
from app.core.security import createAdminToken, verifyPassword
from app.modules.auth.models import User
from app.modules.bookings.models import Booking
from app.modules.packages.models import RoomOption, TourPackage

router = APIRouter(prefix="/admin", tags=["admin"])



# ──────────────────────────────────────
#  Admin Login
# ──────────────────────────────────────


class AdminLoginRequest(BaseModel):
    password: str


@router.post("/auth/login")
async def adminLogin(request: AdminLoginRequest, response: Response):
    """
    Single admin account login.
    Only password is required — credentials stored in .env.
    Returns a token signed with the admin JWT secret.
    """
    if not settings.admin_jwt_secret_key:
        raise HTTPException(
            status_code=500,
            detail="Admin JWT secret is not configured. Set ADMIN_JWT_SECRET_KEY in .env",
        )

    if not settings.admin_password_hash or not verifyPassword(request.password, settings.admin_password_hash):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    token = createAdminToken()

    response.set_cookie(
        key="admin_access_token",
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.admin_jwt_expire_minutes * 60,
    )

    return {"access_token": token, "token_type": "bearer"}


@router.post("/auth/logout")
async def adminLogout(response: Response):
    """Clear the admin session cookie."""
    response.delete_cookie(
        key="admin_access_token",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )
    return {"message": "Admin logged out successfully"}



# ──────────────────────────────────────
#  Response schemas
# ──────────────────────────────────────
#  Response schemas
# ──────────────────────────────────────


class AdminUserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    phone: str | None
    gender: str | None
    role: str
    created_at: datetime
    profile_photo_url: str | None


class AdminUserDetailResponse(AdminUserResponse):
    """Full profile + booking summary for the user detail view."""
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int


# ──────────────────────────────────────
#  Helper
# ──────────────────────────────────────


def _toAdminUser(u: User) -> AdminUserResponse:
    return AdminUserResponse(
        id=str(u.id),
        email=u.email,
        full_name=u.full_name,
        phone=u.phone,
        gender=u.gender,
        role=u.role,
        created_at=u.created_at,
        profile_photo_url=u.profile_photo_url,
    )


# ──────────────────────────────────────
#  User Management
# ──────────────────────────────────────


@router.get("/users", response_model=dict)
async def listUsers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Search by name or email"),
    role: str | None = Query(None, pattern="^(user|admin)$"),
    _: dict = Depends(requireAdmin),
):
    """
    List all users with optional search and role filter.
    Search matches against email and full_name (case-insensitive).
    """
    query: dict = {}

    if role:
        query["role"] = role

    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
        ]

    skip = (page - 1) * page_size
    total = await User.find(query).count()
    users = await User.find(query).sort("-created_at").skip(skip).limit(page_size).to_list()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "users": [_toAdminUser(u) for u in users],
    }


@router.get("/users/detail", response_model=AdminUserDetailResponse)
async def getUserDetail(
    search: str = Query(..., description="Name or email to search"),
    _: dict = Depends(requireAdmin),
):
    """Get full user detail by name or email (case-insensitive, first match)."""
    user = await User.find_one({
        "$or": [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
        ]
    })

    if not user:
        raise HTTPException(status_code=404, detail="No user found matching that name or email")

    user_id = str(user.id)
    all_bookings = await Booking.find(Booking.user_id == user_id).to_list()
    confirmed = sum(1 for b in all_bookings if b.status == "confirmed")
    cancelled = sum(1 for b in all_bookings if b.status == "cancelled")

    return AdminUserDetailResponse(
        id=user_id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        gender=user.gender,
        role=user.role,
        created_at=user.created_at,
        profile_photo_url=user.profile_photo_url,
        total_bookings=len(all_bookings),
        confirmed_bookings=confirmed,
        cancelled_bookings=cancelled,
    )



@router.get("/users/{identifier}", response_model=AdminUserDetailResponse)
async def getUserById(
    identifier: str,
    _: dict = Depends(requireAdmin),
):
    """
    Get full user detail by ID, name, or email.
    - If `identifier` is a valid MongoDB ObjectId → lookup by ID.
    - Otherwise → case-insensitive search on full_name or email (first match).
    """
    user: User | None = None

    # Try ObjectId first
    try:
        oid = PydanticObjectId(identifier)
        user = await User.get(oid)
    except Exception:
        pass

    # Fall back to name / email search
    if not user:
        user = await User.find_one({
            "$or": [
                {"email": {"$regex": f"^{identifier}$", "$options": "i"}},
                {"full_name": {"$regex": identifier, "$options": "i"}},
            ]
        })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No user found with that ID, name, or email",
        )

    user_id = str(user.id)
    all_bookings = await Booking.find(Booking.user_id == user_id).to_list()
    confirmed = sum(1 for b in all_bookings if b.status == "confirmed")
    cancelled = sum(1 for b in all_bookings if b.status == "cancelled")

    return AdminUserDetailResponse(
        id=user_id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        gender=user.gender,
        role=user.role,
        created_at=user.created_at,
        profile_photo_url=user.profile_photo_url,
        total_bookings=len(all_bookings),
        confirmed_bookings=confirmed,
        cancelled_bookings=cancelled,
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteUser(
    user_id: str,
    _: dict = Depends(requireAdmin),
):
    """
    Permanently delete a user account and all their bookings.
    """
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        user = None

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await Booking.find(Booking.user_id == user_id).delete()
    await user.delete()


# ──────────────────────────────────────
#  Packages Admin
# ──────────────────────────────────────


class AdminCreatePackageRequest(BaseModel):
    """
    Full schema matching the dataset structure.
    All fields mirror TourPackage document fields exactly.
    """
    package_id: str = Field(..., description="Unique human-readable ID, e.g. GOA_3D2N_001")
    title: str
    from_: str = Field(..., alias="from", description="Departure city / region")
    destination: str
    days: int = Field(..., ge=1)
    nights: int = Field(..., ge=0)
    price_per_person: float = Field(..., ge=0)
    price_per_child: Optional[float] = Field(None, ge=0, description="None = children not applicable")
    gst_included: bool = False
    inclusions: list[str] = []
    exclusions: list[str] = []
    itinerary: list[str] = []
    highlights: list[str] = []
    description: str = ""
    package_url: str = Field("", description="Auto-set to /packages/{package_id} if left blank")
    traveler_type: list[str] = Field(
        [],
        description="Tags: family / honeymoon / solo / senior / friends / adventure / corporate",
    )
    images: list[str] = []
    available_dates: list[date] = []
    room_options: list[RoomOption] = []

    class Config:
        populate_by_name = True


class AdminUpdatePackageRequest(BaseModel):
    """Partial update — all fields optional."""
    title: Optional[str] = None
    from_: Optional[str] = Field(None, alias="from")
    destination: Optional[str] = None
    days: Optional[int] = Field(None, ge=1)
    nights: Optional[int] = Field(None, ge=0)
    price_per_person: Optional[float] = Field(None, ge=0)
    price_per_child: Optional[float] = Field(None, ge=0)
    gst_included: Optional[bool] = None
    inclusions: Optional[list[str]] = None
    exclusions: Optional[list[str]] = None
    itinerary: Optional[list[str]] = None
    highlights: Optional[list[str]] = None
    description: Optional[str] = None
    package_url: Optional[str] = None
    traveler_type: Optional[list[str]] = None
    images: Optional[list[str]] = None
    available_dates: Optional[list[date]] = None
    room_options: Optional[list[RoomOption]] = None

    class Config:
        populate_by_name = True


@router.get("/packages", response_model=dict)
async def adminListPackages(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Search by title or destination"),
    traveler_type: str | None = Query(None, description="Filter by traveler type tag"),
    destination: str | None = Query(None, description="Filter by destination"),
    _: dict = Depends(requireAdmin),
):
    """
    List all tour packages with optional search and filter.
    Embedding field is always excluded from responses.
    """
    query: dict = {}

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"destination": {"$regex": search, "$options": "i"}},
            {"package_id": {"$regex": search, "$options": "i"}},
        ]

    if destination:
        query["destination"] = {"$regex": destination, "$options": "i"}

    if traveler_type:
        query["traveler_type"] = traveler_type

    skip = (page - 1) * page_size
    total = await TourPackage.find(query).count()
    packages = await TourPackage.find(query).sort("+title").skip(skip).limit(page_size).to_list()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "packages": [p.model_dump(exclude={"embedding", "id"}) for p in packages],
    }


@router.get("/packages/{package_id}", response_model=dict)
async def adminGetPackage(
    package_id: str,
    _: dict = Depends(requireAdmin),
):
    """Get full details of a single package by its package_id."""
    package = await TourPackage.find_one(TourPackage.package_id == package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package.model_dump(exclude={"embedding", "id"})


@router.post("/packages", status_code=status.HTTP_201_CREATED, response_model=dict)
async def adminCreatePackage(
    request: AdminCreatePackageRequest,
    _: dict = Depends(requireAdmin),
):
    """
    Create a new tour package.
    - package_id must be unique.
    - package_url defaults to /packages/{package_id} if not provided.
    """
    # Enforce unique package_id
    existing = await TourPackage.find_one(TourPackage.package_id == request.package_id)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"A package with package_id '{request.package_id}' already exists",
        )

    package_url = request.package_url or f"/packages/{request.package_id}"

    package = TourPackage(
        package_id=request.package_id,
        title=request.title,
        from_=request.from_,
        destination=request.destination,
        days=request.days,
        nights=request.nights,
        price_per_person=request.price_per_person,
        price_per_child=request.price_per_child,
        gst_included=request.gst_included,
        inclusions=request.inclusions,
        exclusions=request.exclusions,
        itinerary=request.itinerary,
        highlights=request.highlights,
        description=request.description,
        package_url=package_url,
        traveler_type=request.traveler_type,
        images=request.images,
        available_dates=request.available_dates,
        room_options=request.room_options,
        embedding=[],
    )
    await package.insert()

    return package.model_dump(exclude={"embedding", "id"})


@router.put("/packages/{package_id}", response_model=dict)
async def adminReplacePackage(
    package_id: str,
    request: AdminCreatePackageRequest,
    _: dict = Depends(requireAdmin),
):
    """
    Full replacement of a package (PUT).
    Preserves the existing MongoDB document _id and embedding.
    """
    package = await TourPackage.find_one(TourPackage.package_id == package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    package_url = request.package_url or f"/packages/{package_id}"

    package.title = request.title
    package.from_ = request.from_
    package.destination = request.destination
    package.days = request.days
    package.nights = request.nights
    package.price_per_person = request.price_per_person
    package.price_per_child = request.price_per_child
    package.gst_included = request.gst_included
    package.inclusions = request.inclusions
    package.exclusions = request.exclusions
    package.itinerary = request.itinerary
    package.highlights = request.highlights
    package.description = request.description
    package.package_url = package_url
    package.traveler_type = request.traveler_type
    package.images = request.images
    package.available_dates = request.available_dates
    package.room_options = request.room_options

    await package.save()
    return package.model_dump(exclude={"embedding", "id"})


@router.patch("/packages/{package_id}", response_model=dict)
async def adminPatchPackage(
    package_id: str,
    request: AdminUpdatePackageRequest,
    _: dict = Depends(requireAdmin),
):
    """
    Partial update - only provided fields are updated.
    Uses raw Motor (MongoDB driver) to bypass Pydantic re-validation
    of older documents missing newer fields (images, room_options, etc.).
    """
    collection = TourPackage.get_motor_collection()

    existing = await collection.find_one({"package_id": package_id}, {"_id": 1})
    if not existing:
        raise HTTPException(status_code=404, detail="Package not found")

    update_data = request.model_dump(exclude_unset=True, by_alias=False)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    mongo_update: dict = {}
    for field, value in update_data.items():
        mongo_key = "from" if field == "from_" else field
        if hasattr(value, "model_dump"):
            mongo_update[mongo_key] = value.model_dump()
        elif isinstance(value, list):
            mongo_update[mongo_key] = [
                v.model_dump() if hasattr(v, "model_dump") else v for v in value
            ]
        else:
            mongo_update[mongo_key] = value

    await collection.update_one({"package_id": package_id}, {"$set": mongo_update})

    updated = await collection.find_one({"package_id": package_id})
    updated.pop("_id", None)
    updated.pop("embedding", None)
    return updated


@router.delete("/packages/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
async def adminDeletePackage(
    package_id: str,
    _: dict = Depends(requireAdmin),
):
    """
    Permanently delete a package.
    Note: existing bookings that reference this package are NOT deleted;
    they retain their denormalized package_title and destination fields.
    """
    package = await TourPackage.find_one(TourPackage.package_id == package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    await package.delete()
