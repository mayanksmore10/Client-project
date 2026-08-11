# AI-Powered Tour Package Recommendation API

FastAPI implementation of the RAG-based tour package recommendation system:
Gemini embeddings + MongoDB Atlas Vector Search, with a structured
re-ranking pass on top of semantic similarity.

## How it works

1. `POST /recommend-packages` takes a free-text query.
2. Gemini parses structured fields out of it (destination, days, nights, budget, GST).
3. The query is embedded with the Gemini embedding model.
4. MongoDB Atlas Vector Search retrieves the top semantically similar packages.
5. Candidates are re-ranked using the structured fields (destination match, duration
   closeness, budget closeness, GST preference) — so semantic similarity alone
   never overrides an obvious mismatch.
6. Gemini generates a conversational summary grounded ONLY in the retrieved
   packages (it's instructed never to invent names, prices, or links).
7. The API returns that message plus structured package cards for the frontend.

## Project layout

```
app/
  core/config.py            settings loaded from .env
  models/package.py         Beanie document (MongoDB schema)
  models/schemas.py         API request/response models
  services/embedding_service.py     Gemini embeddings (ingestion + query)
  services/vector_search_service.py MongoDB Atlas $vectorSearch + re-ranking
  services/gemini_service.py        query parsing + grounded generation
  services/recommendation_service.py orchestrates the full pipeline
  routers/recommendations.py        POST /recommend-packages
  routers/packages.py               GET /packages, GET /packages/{id}
  main.py                           app entrypoint, DB lifecycle
scripts/ingest_packages.py  embeds + upserts package JSON into Atlas
data/dummy_packages.json    sample package data to seed the database
atlas_vector_index.json     vector index definition to create in Atlas
```

## Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # fill in MONGODB_URI and GEMINI_API_KEY
   ```

3. **Create the Atlas Vector Search index**
   In MongoDB Atlas, on the `packages` collection, create a Vector Search
   index using `atlas_vector_index.json` (Atlas UI → Search → Create Index →
   JSON Editor). The `numDimensions` (768) must match `EMBEDDING_DIMENSIONS`
   in your `.env` and whatever the Gemini embedding model actually returns.

4. **Ingest sample data**
   ```bash
   python -m scripts.ingest_packages data/dummy_packages.json
   ```
   This embeds each package with Gemini and upserts it into Atlas.

5. **Run the API**
   ```bash
   uvicorn app.main:app --reload
   ```
   Docs available at `http://localhost:8000/docs`.

## Example request

```bash
curl -X POST http://localhost:8000/recommend-packages \
  -H "Content-Type: application/json" \
  -d '{"query": "I want a 3 days 2 nights Mumbai to Goa trip, around ₹10,000 per person, including GST."}'
```

Example response shape:
```json
{
  "message": "I found a few Goa packages that closely match...",
  "packages": [
    {
      "package_id": "GOA_3D2N_001",
      "title": "Mumbai to Goa 3D/2N Package",
      "destination": "Goa",
      "days": 3,
      "nights": 2,
      "price_per_person": 10000,
      "gst_included": true,
      "inclusions": ["Accommodation", "Breakfast", "Transfers"],
      "itinerary_summary": "Day 1: Mumbai to Goa and hotel check-in; Day 2: Goa sightseeing; ...",
      "package_url": "/packages/GOA_3D2N_001",
      "score": 0.91
    }
  ],
  "query_understood_as": {
    "destination": "Goa",
    "origin": "Mumbai",
    "days": 3,
    "nights": 2,
    "budget": 10000,
    "gst_required": true
  }
}
```

## Notes / things to wire up before production

- **Auth**: no auth is implemented on the endpoints — add whatever your
  existing site uses (API gateway, JWT, session, etc.) in front of this.
- **Rate limiting**: not implemented; add it (e.g. slowapi) before exposing
  publicly, since every request calls Gemini twice.
- **Secrets**: `.env` is for local dev only — use your platform's secret
  manager in production (matches design doc section 14).
- **Model names**: `gemini-1.5-flash` and `text-embedding-004` are set as
  sensible defaults in `config.py` — swap for whichever Gemini models your
  account has access to.
- **Admin/re-embedding**: `scripts/ingest_packages.py` is a manual CLI tool;
  design doc section 15 calls for an admin UI for this — not built here.
