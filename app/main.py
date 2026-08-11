import logging
from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models.package import TourPackage
from app.routers import packages, recommendations

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db_name]
    await init_beanie(database=db, document_models=[TourPackage])
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

app.include_router(recommendations.router)
app.include_router(packages.router)


@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.app_name}"}


@app.get("/health")
async def healthCheck():
    return {"status": "ok", "service": settings.app_name}
