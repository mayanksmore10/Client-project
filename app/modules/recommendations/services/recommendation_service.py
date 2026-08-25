import asyncio
import logging

from app.core.config import settings
from app.modules.recommendations.schemas import PackageCard, RecommendationResponse
from app.modules.recommendations.services import embedding_service, gemini_service, vector_search_service

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
        package_url=f"{settings.base_url.rstrip('/')}{pkg.get('package_url', '')}",
        score=pkg.get("score"),
    )


async def recommendPackages(query: str, top_k: int | None = None) -> RecommendationResponse:
    final_count = top_k or settings.final_results_count

    parsed_query, query_embedding = await asyncio.gather(
        gemini_service.parseQuery(query),
        embedding_service.embedQuery(query),
    )

    candidates = await vector_search_service.vectorSearch(query_embedding)

    ranked = vector_search_service.applyStructuredRanking(
        candidates, parsed_query, final_count
    )

    return RecommendationResponse(
        packages=[_toPackageCard(p) for p in ranked],
        query_understood_as=parsed_query or None,
    )
