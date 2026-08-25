from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, status
import os
import uuid
from datetime import datetime, timezone

from app.core.config import settings
from app.core.dependencies import getCurrentUser
from app.core.security import createAccessToken, hashPassword, verifyPassword
from app.modules.auth.models import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
    User,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    existing = await User.find_one(User.email == request.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = User(
        email=request.email,
        password_hash=hashPassword(request.password),
        full_name=request.full_name,
    )
    await user.insert()

    return UserResponse(
        id=str(user.id), email=user.email, full_name=user.full_name, role=user.role
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, response: Response):
    user = await User.find_one(User.email == request.email)

    invalid_credentials = HTTPException(status_code=401, detail="Invalid email or password")

    if not user:
        raise invalid_credentials
    if not verifyPassword(request.password, user.password_hash):
        raise invalid_credentials

    token = createAccessToken(user_id=str(user.id), role=user.role)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.jwt_expire_minutes * 60,
    )

    return TokenResponse(access_token=token)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(getCurrentUser)):

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        gender=current_user.gender,
        date_of_birth=current_user.date_of_birth,
        profile_photo_url=current_user.profile_photo_url,
        role=current_user.role,
    )


@router.patch("/me", response_model=UserResponse)
async def updateProfile(
    request: UpdateProfileRequest,
    current_user: User = Depends(getCurrentUser),
):
    update_data = request.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await current_user.save()

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        gender=current_user.gender,
        date_of_birth=current_user.date_of_birth,
        profile_photo_url=current_user.profile_photo_url,
        role=current_user.role,
    )


@router.post("/me/photo", response_model=UserResponse)
async def uploadPhoto(
    file: UploadFile = File(...),
    current_user: User = Depends(getCurrentUser),
):
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    allowed_exts = {"jpg", "jpeg", "png", "webp"}
    ext = (file.filename.rsplit(".", 1)[-1].lower()) if file.filename and "." in file.filename else ""
    if file.content_type not in allowed_types and ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are allowed")

    upload_dir = os.path.join(os.getcwd(), "uploads", "profile_photos")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(upload_dir, filename)

    MAX_UPLOAD_BYTES = 5 * 1024 * 1024
    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")
    with open(filepath, "wb") as f:
        f.write(contents)

    photo_url = f"{settings.base_url.rstrip('/')}/uploads/profile_photos/{filename}"
    current_user.profile_photo_url = photo_url
    await current_user.save()

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        gender=current_user.gender,
        date_of_birth=current_user.date_of_birth,
        profile_photo_url=current_user.profile_photo_url,
        role=current_user.role,
    )


@router.post("/change-password")
async def changePassword(
    request: ChangePasswordRequest,
    current_user: User = Depends(getCurrentUser),
):
    if not verifyPassword(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = hashPassword(request.new_password)
    await current_user.save()

    return {"message": "Password changed successfully"}