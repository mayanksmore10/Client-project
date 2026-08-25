import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.modules.auth import router as auth
from app.modules.bookings import router as bookings
from app.modules.contact import router as contact
from app.modules.home import router as home
from app.modules.packages import router as packages
from app.modules.recommendations import router as recommendations
from app.modules.reviews import router as reviews

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(home.router)
app.include_router(packages.router)
app.include_router(bookings.router)
app.include_router(contact.router)
app.include_router(recommendations.router)
app.include_router(reviews.router)

uploads_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.app_name}"}


@app.get("/health")
async def healthCheck():
    return {"status": "ok", "service": settings.app_name}
