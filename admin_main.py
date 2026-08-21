import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from admin.router import router as admin_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


admin_app = FastAPI(
    title=f"{settings.app_name} — Admin API",
    description="Internal admin-only API. Not for public access.",
    lifespan=lifespan,
    # Hide from public docs by disabling openapi in production if needed
    # openapi_url=None,  # uncomment to fully hide docs in production
)

# Strict CORS — only allow your admin frontend origin
# Change this to your actual admin panel URL in production
admin_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.admin_cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Admin Routers ---
admin_app.include_router(admin_router)


@admin_app.get("/")
async def root():
    return {"message": f"{settings.app_name} Admin API"}


@admin_app.get("/health")
async def healthCheck():
    return {"status": "ok", "service": f"{settings.app_name} Admin"}


@admin_app.get("/_debug_hash")
async def debugHash():
    import os
    from app.core.security import verifyPassword
    h = settings.admin_password_hash
    ok = verifyPassword("Admin123", h) if h else False
    return {
        "full_hash": h,
        "env_var": os.environ.get("ADMIN_PASSWORD_HASH"),
        "cwd": os.getcwd(),
        "verify_result": ok,
    }
