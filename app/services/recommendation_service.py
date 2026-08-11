"""
Orchestrates the full pipeline described in design doc section 6:

  1. embed the query
  2. vector search in MongoDB Atlas
  3. structured re-ranking
  4. build RAG context
  5. generate grounded response with Gemini
  6. shape the result into package cards
"""

import logging

from app.core.config import settings
from app.models.schemas import PackageCard, RecommendationResponse
from app.services import embedding_service, gemini_service, vector_search_service

logger = logging.getLogger(__name__)


def _itinerarySummary(itinerary: list[str], max_items: int = 2) -> str:
    if not itinerary:
        return ""
    summary = "; ".join(itinerary[:max_items])
    if len(itinerary) > max_items:
        summary += "; ..."
    return summary


def _toPackageCard(pkg: dict) -> PackageCard:
    return PackageCard(
        package_id=pkg.get("package_id", ""),
        title=pkg.get("title", ""),
        destination=pkg.get("destination", ""),
        days=pkg.get("days", 0),
        nights=pkg.get("nights", 0),
        price_per_person=pkg.get("price_per_person", 0),
        gst_included=pkg.get("gst_included", False),
        inclusions=pkg.get("inclusions", []),
        itinerary_summary=_itinerarySummary(pkg.get("itinerary", [])),
        package_url=pkg.get("package_url", ""),
        score=pkg.get("score"),
    )


async def recommendPackages(query: str, top_k: int | None = None) -> RecommendationResponse:
    final_count = top_k or settings.final_results_count

    # 1 & 2. Parse structured constraints and embed the query in parallel-ish
    # (kept sequential for simplicity / clearer error handling).
    parsed_query = await gemini_service.parseQuery(query)
    query_embedding = await embedding_service.embedQuery(query)

    # 3. Vector search
    candidates = await vector_search_service.vectorSearch(query_embedding)

    # 4. Structured re-ranking on top of semantic candidates
    ranked = vector_search_service.applyStructuredRanking(
        candidates, parsed_query, final_count
    )

    # 5. Shape response
    return RecommendationResponse(
        packages=[_toPackageCard(p) for p in ranked],
        query_understood_as=parsed_query or None,
    )
