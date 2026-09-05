import logging
from typing import Any

from app.core.config import settings
from app.modules.packages.models import TourPackage

logger = logging.getLogger(__name__)


async def vectorSearch(query_embedding: list[float], top_k: int | None = None) -> list[dict[str, Any]]:
    if not query_embedding:
        return []

    k = top_k or settings.vector_search_top_k

    pipeline = [
        {
            "$vectorSearch": {
                "index": settings.vector_index_name,
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": max(k * 10, 100),
                "limit": k,
            }
        },
        {
            "$project": {
                "embedding": 0,
                "score": {"$meta": "vectorSearchScore"},
            }
        },
    ]

    try:
        collection = TourPackage.get_motor_collection()
        cursor = collection.aggregate(pipeline)
        return await cursor.to_list(length=k)
    except Exception as exc:
        logger.warning("MongoDB Vector Search failed: %s. Falling back to database keyword search.", exc)
        return []


async def fallbackSearch(
    query: str,
    parsed_query: dict[str, Any],
    top_k: int = 10,
) -> list[dict[str, Any]]:
    """Fallback search when vector search index or embeddings are unavailable."""
    conditions = []

    destination = (parsed_query.get("destination") or "").strip()
    if destination:
        conditions.append({"destination": {"$regex": destination, "$options": "i"}})
        conditions.append({"title": {"$regex": destination, "$options": "i"}})

    stop_words = {
        "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or",
        "is", "with", "trip", "tour", "tours", "package", "packages", "best", "want"
    }
    raw_words = [
        w.strip() for w in query.split()
        if len(w.strip()) >= 2 and w.lower().strip() not in stop_words
    ]

    for word in raw_words:
        conditions.append({"destination": {"$regex": word, "$options": "i"}})
        conditions.append({"title": {"$regex": word, "$options": "i"}})
        conditions.append({"inclusions": {"$elemMatch": {"$regex": word, "$options": "i"}}})
        conditions.append({"itinerary": {"$elemMatch": {"$regex": word, "$options": "i"}}})

    mongo_filter = {"$or": conditions} if conditions else {}

    try:
        collection = TourPackage.get_motor_collection()
        packages = await collection.find(mongo_filter, {"embedding": 0}).to_list(length=top_k * 2)

        if not packages and mongo_filter:
            packages = await collection.find({}, {"embedding": 0}).limit(top_k).to_list(length=top_k)

        for pkg in packages:
            pkg["score"] = 0.5

        return packages
    except Exception as exc:
        logger.error("Fallback MongoDB search failed: %s", exc)
        return []


def applyStructuredRanking(
    candidates: list[dict[str, Any]],
    parsed_query: dict[str, Any],
    final_count: int,
) -> list[dict[str, Any]]:
    destination = (parsed_query.get("destination") or "").strip().lower()
    budget = parsed_query.get("budget")
    days = parsed_query.get("days")
    nights = parsed_query.get("nights")
    gst_required = parsed_query.get("gst_required")

    def rerankScore(pkg: dict[str, Any]) -> float:
        score = pkg.get("score", 0.0)

        if destination and pkg.get("destination", "").lower() == destination:
            score += 0.5
        elif destination and destination not in pkg.get("destination", "").lower():
            score -= 0.3

        if days is not None and pkg.get("days") is not None:
            score -= 0.03 * abs(pkg["days"] - days)
        if nights is not None and pkg.get("nights") is not None:
            score -= 0.03 * abs(pkg["nights"] - nights)

        if budget:
            price = pkg.get("price_per_person", 0)
            diff_ratio = abs(price - budget) / max(budget, 1)
            score -= 0.4 * min(diff_ratio, 1.0)

        if gst_required is True and not pkg.get("gst_included", False):
            score -= 0.15
        elif gst_required is False and pkg.get("gst_included", False):
            score -= 0.05

        return score

    ranked = sorted(candidates, key=rerankScore, reverse=True)
    return ranked[:final_count]
