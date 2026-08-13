import logging
from contextlib import asynccontextmanager
from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import os

from app.core.config import settings
from app.models.booking import Booking
from app.models.contact import ContactEnquiry
from app.models.package import TourPackage
from app.models.review import Review
from app.models.user import User
from app.routers import auth, bookings, contact, home, packages, recommendations

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db_name]
    await init_beanie(
        database=db,
        document_models=[TourPackage, User, Booking, Review, ContactEnquiry],
    )
    logger.info("Connected to MongoDB Atlas database '%s'", settings.mongodb_db_name)

    yield

    client.close()
    logger.info("MongoDB connection closed")


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth.router)
app.include_router(home.router)
app.include_router(packages.router)
app.include_router(bookings.router)
app.include_router(contact.router)
app.include_router(recommendations.router)

# --- Static file serving for uploads (profile photos, etc.) ---
uploads_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.app_name}"}


@app.get("/health")
async def healthCheck():
    return {"status": "ok", "service": settings.app_name}
