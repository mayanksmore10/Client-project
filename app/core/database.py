import logging
import certifi
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

from app.modules.packages.models import TourPackage
from app.modules.auth.models import User
from app.modules.bookings.models import Booking
from app.modules.reviews.models import Review
from app.modules.contact.models import ContactEnquiry

logger = logging.getLogger(__name__)

client = None

async def connect_to_mongo():
    global client
    client = AsyncIOMotorClient(
        settings.mongodb_uri,
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=False,
    )
    db = client[settings.mongodb_db_name]
    
    await init_beanie(
        database=db,
        document_models=[TourPackage, User, Booking, Review, ContactEnquiry],
    )
    logger.info("Connected to MongoDB Atlas database '%s'", settings.mongodb_db_name)

async def close_mongo_connection():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")
