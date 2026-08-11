import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import RecommendationRequest, RecommendationResponse
from app.services import recommendation_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommend-packages", tags=["recommendations"])


@router.post("", response_model=RecommendationResponse)
async def recommendPackages(request: RecommendationRequest) -> RecommendationResponse:
    """
    Accepts a free-text travel requirement and returns a grounded,
    conversational recommendation plus package cards (design doc section 12).
    """
    try:
        return await recommendation_service.recommendPackages(
            query=request.query, top_k=request.top_k
        )
    except Exception as exc:
        logger.exception("Failed to generate recommendation")
        raise HTTPException(
            status_code=502,
            detail="Failed to generate a recommendation right now. Please try again.",
        ) from exc
