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
)

admin_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.admin_cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

admin_app.include_router(admin_router)


@admin_app.get("/")
async def root():
    return {"message": f"{settings.app_name} Admin API"}


@admin_app.get("/health")
async def healthCheck():
    return {"status": "ok", "service": f"{settings.app_name} Admin"}

