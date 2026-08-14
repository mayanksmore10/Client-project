import asyncio
import json
import sys
from pathlib import Path

# Add project root to sys.path so 'app' package is importable when running directly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.modules.recommendations.services.embedding_service import embedPackage


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
