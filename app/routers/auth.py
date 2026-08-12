from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import getCurrentUser
from app.core.security import createAccessToken, hashPassword, verifyPassword
from app.models.user import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
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
async def login(request: LoginRequest):
    user = await User.find_one(User.email == request.email)

    # Same error for "no such user" and "wrong password" — don't leak which one.
    invalid_credentials = HTTPException(status_code=401, detail="Invalid email or password")

    if not user:
        raise invalid_credentials
    if not verifyPassword(request.password, user.password_hash):
        raise invalid_credentials

    token = createAccessToken(user_id=str(user.id), role=user.role)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(getCurrentUser)):

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )