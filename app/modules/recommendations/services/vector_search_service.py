"""
Handles semantic retrieval against MongoDB Atlas Vector Search, plus the
structured re-ranking pass described in design doc section 11
(Recommendation Logic) — semantic similarity alone is not trusted; it's
combined with destination/duration/budget/GST signals.
"""

import logging
from typing import Any

from app.core.config import settings
from app.modules.packages.models import TourPackage

logger = logging.getLogger(__name__)


async def vectorSearch(query_embedding: list[float], top_k: int | None = None) -> list[dict[str, Any]]:
    """
    Runs a MongoDB Atlas $vectorSearch aggregation and returns the raw
    candidate documents with their similarity score attached.
    """
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
                "embedding": 0,  # don't ship the raw vector back over the wire
                "score": {"$meta": "vectorSearchScore"},
            }
        },
    ]

    collection = TourPackage.get_motor_collection()
    cursor = collection.aggregate(pipeline)
    return await cursor.to_list(length=k)


def applyStructuredRanking(
    candidates: list[dict[str, Any]],
    parsed_query: dict[str, Any],
    final_count: int,
) -> list[dict[str, Any]]:
    """
    Re-ranks vector-search candidates using structured constraints, so a
    semantically-similar-but-wrong package (e.g. right vibe, wrong city or
    2x the budget) doesn't outrank a better structural match.

    parsed_query is expected to optionally contain:
      destination, days, nights, budget, gst_required
    """
    destination = (parsed_query.get("destination") or "").strip().lower()
    budget = parsed_query.get("budget")
    days = parsed_query.get("days")
    nights = parsed_query.get("nights")
    gst_required = parsed_query.get("gst_required")

    def rerankScore(pkg: dict[str, Any]) -> float:
        score = pkg.get("score", 0.0)  # base: vector similarity, ~0-1

        # Destination match is weighted heavily.
        if destination and pkg.get("destination", "").lower() == destination:
            score += 0.5
        elif destination and destination not in pkg.get("destination", "").lower():
            score -= 0.3

        # Duration closeness.
        if days is not None and pkg.get("days") is not None:
            score -= 0.03 * abs(pkg["days"] - days)
        if nights is not None and pkg.get("nights") is not None:
            score -= 0.03 * abs(pkg["nights"] - nights)

        # Budget closeness (as a fraction of requested budget).
        if budget:
            price = pkg.get("price_per_person", 0)
            diff_ratio = abs(price - budget) / max(budget, 1)
            score -= 0.4 * min(diff_ratio, 1.0)

        # GST preference.
        if gst_required is True and not pkg.get("gst_included", False):
            score -= 0.15
        elif gst_required is False and pkg.get("gst_included", False):
            score -= 0.05

        return score

    ranked = sorted(candidates, key=rerankScore, reverse=True)
    return ranked[:final_count]
