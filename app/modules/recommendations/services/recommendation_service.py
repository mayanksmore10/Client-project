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
    pkg_id = pkg.get("package_id") or str(pkg.get("_id", ""))
    package_url = pkg.get("package_url") or f"/packages/{pkg_id}"
    if not package_url.startswith("http"):
        package_url = f"{settings.base_url.rstrip('/')}{package_url if package_url.startswith('/') else '/' + package_url}"

    return PackageCard(
        package_id=str(pkg_id),
        title=pkg.get("title", ""),
        destination=pkg.get("destination", ""),
        days=pkg.get("days", 0),
        nights=pkg.get("nights", 0),
        price_per_person=pkg.get("price_per_person", 0),
        gst_included=pkg.get("gst_included", False),
        inclusions=pkg.get("inclusions", []),
        itinerary_summary=_itinerarySummary(pkg.get("itinerary", [])),
        package_url=package_url,
        score=pkg.get("score"),
    )


async def recommendPackages(query: str, top_k: int | None = None) -> RecommendationResponse:
    final_count = top_k or settings.final_results_count

    parsed_query = {}
    query_embedding = []

    try:
        results = await asyncio.gather(
            gemini_service.parseQuery(query),
            embedding_service.embedQuery(query),
            return_exceptions=True,
        )
        if len(results) > 0 and not isinstance(results[0], Exception) and results[0]:
            parsed_query = results[0]
        if len(results) > 1 and not isinstance(results[1], Exception) and results[1]:
            query_embedding = results[1]
    except Exception as exc:
        logger.warning("Error gathering query parsing/embedding: %s", exc)

    candidates = []
    if query_embedding:
        try:
            candidates = await vector_search_service.vectorSearch(query_embedding, top_k=final_count * 2)
        except Exception as exc:
            logger.warning("Vector search error: %s", exc)

    if not candidates:
        logger.info("Vector search produced 0 candidates. Falling back to MongoDB keyword search.")
        candidates = await vector_search_service.fallbackSearch(
            query=query, parsed_query=parsed_query, top_k=final_count * 2
        )

    ranked = vector_search_service.applyStructuredRanking(
        candidates, parsed_query, final_count
    )

    return RecommendationResponse(
        packages=[_toPackageCard(p) for p in ranked],
        query_understood_as=parsed_query or None,
    )
