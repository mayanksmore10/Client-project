import asyncio
import logging

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

_client = genai.Client(api_key=settings.gemini_api_key)


def _packageToEmbeddingText(package: dict) -> str:
    parts = [
        package.get("title", ""),
        f"From {package.get('from', '')} to {package.get('destination', '')}",
        f"{package.get('days')} days {package.get('nights')} nights",
        f"Price per person: {package.get('price_per_person')}",
        "GST included" if package.get("gst_included") else "GST not included",
        "Inclusions: " + ", ".join(package.get("inclusions", [])),
        "Itinerary: " + " ".join(package.get("itinerary", [])),
    ]
    return "\n".join(p for p in parts if p)


async def embedPackage(package: dict) -> list[float]:
    text = _packageToEmbeddingText(package)
    return await _embedText(text, task_type="RETRIEVAL_DOCUMENT")


async def embedQuery(query: str) -> list[float]:
    return await _embedText(query, task_type="RETRIEVAL_QUERY")


async def _embedText(text: str, task_type: str) -> list[float]:
    try:
        result = await asyncio.to_thread(
            _client.models.embed_content,
            model=settings.gemini_embedding_model,
            contents=text,
            config=types.EmbedContentConfig(
                task_type=task_type,
                output_dimensionality=settings.embedding_dimensions,
            ),
        )
        return result.embeddings[0].values
    except Exception as exc:
        logger.error("Embedding generation failed: %s", exc)
        raise
