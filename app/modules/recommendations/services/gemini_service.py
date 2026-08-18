import json
import logging

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

_client = genai.Client(api_key=settings.gemini_api_key)

_PARSE_SYSTEM_PROMPT = """You extract structured travel search fields from a user's \
free-text request. Respond with ONLY a JSON object, no markdown fences, no prose, \
using this exact shape:

{
  "destination": string or null,
  "origin": string or null,
  "days": integer or null,
  "nights": integer or null,
  "budget": number or null,
  "gst_required": true, false, or null
}

If a field isn't mentioned or can't be inferred, use null."""

_RAG_SYSTEM_PROMPT = """You are a travel assistant for a tours and travel company. \
You recommend tour packages to the user based ONLY on the package data provided to \
you in the context below. Rules:

- Never invent a package name, price, itinerary, inclusion, or URL that is not in \
the provided context.
- If none of the provided packages are a reasonable match, say so plainly instead \
of forcing a recommendation.
- Keep the tone conversational and helpful, not a raw data dump.
- For each recommended package, briefly explain why it matches the user's request.
- Do not output JSON or markdown tables — plain conversational text only, since a \
separate part of the system renders the package cards."""


async def parseQuery(query: str) -> dict:
    """Extract structured constraints from the user's free-text query."""
    try:
        response = _client.models.generate_content(
            model=settings.gemini_generation_model,
            contents=query,
            config=types.GenerateContentConfig(
                system_instruction=_PARSE_SYSTEM_PROMPT,
                temperature=0,
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except Exception as exc:
        logger.error("Query parsing failed, falling back to empty constraints: %s", exc)
        return {}


async def generateRecommendation(query: str, retrieved_packages: list[dict]) -> str:
    """Generate the final grounded, conversational recommendation message."""
    if not retrieved_packages:
        return (
            "I couldn't find any packages in our catalog that closely match your "
            "request. Try adjusting your destination, dates, or budget and I'll "
            "take another look."
        )

    context_blob = json.dumps(
        [
            {
                "package_id": p.get("package_id"),
                "title": p.get("title"),
                "destination": p.get("destination"),
                "days": p.get("days"),
                "nights": p.get("nights"),
                "price_per_person": p.get("price_per_person"),
                "gst_included": p.get("gst_included"),
                "inclusions": p.get("inclusions"),
                "itinerary": p.get("itinerary"),
            }
            for p in retrieved_packages
        ],
        indent=2,
    )

    prompt = f"User request: {query}\n\nAvailable matching packages (JSON):\n{context_blob}"

    try:
        response = _client.models.generate_content(
            model=settings.gemini_generation_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=_RAG_SYSTEM_PROMPT,
                temperature=0.4,
            ),
        )
        return response.text.strip()
    except Exception as exc:
        logger.error("Recommendation generation failed: %s", exc)
        return (
            "I found some matching packages, but ran into an issue generating a "
            "summary. Please see the package cards below."
        )
