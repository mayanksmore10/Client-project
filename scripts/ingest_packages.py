"""
Ingestion script (design doc section 6, steps 1-3):
  - reads package JSON documents
  - generates an embedding per package via Gemini
  - upserts each package (with its embedding) into MongoDB Atlas

Usage:
    python -m scripts.ingest_packages data/dummy_packages.json

Make sure your .env is configured (MONGODB_URI, GEMINI_API_KEY) before running.
Also make sure the Atlas Vector Search index has been created (see README) —
this script only writes the vectors, it does not create the index itself.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add project root to sys.path so 'app' package is importable when running directly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.services.embedding_service import embedPackage


async def ingest(file_path: str):
    with open(file_path, "r", encoding="utf-8") as f:
        packages = json.load(f)

    client = AsyncIOMotorClient(settings.mongodb_uri)
    collection = client[settings.mongodb_db_name][settings.mongodb_collection_name]

    for pkg in packages:
        embedding = await embedPackage(pkg)
        pkg["embedding"] = embedding
        await collection.update_one(
            {"package_id": pkg["package_id"]},
            {"$set": pkg},
            upsert=True,
        )
        print(f"Ingested {pkg['package_id']} ({len(embedding)}-dim embedding)")

    client.close()
    print(f"Done. Ingested {len(packages)} packages into "
          f"{settings.mongodb_db_name}.{settings.mongodb_collection_name}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m scripts.ingest_packages <path-to-json-file>")
        sys.exit(1)

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"File not found: {path}")
        sys.exit(1)

    asyncio.run(ingest(str(path)))
