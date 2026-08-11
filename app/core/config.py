"""
Application configuration, loaded from environment variables / .env file.
Nothing sensitive is hardcoded here — see .env.example for the variables
you need to set.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- MongoDB Atlas ---
    mongodb_uri: str
    mongodb_db_name: str = "tours_db"
    mongodb_collection_name: str = "packages"
    vector_index_name: str = "package_vector_index"

    # --- Gemini ---
    gemini_api_key: str
    gemini_embedding_model: str = "text-embedding-004"
    gemini_generation_model: str = "gemini-1.5-flash"

    # --- Retrieval / RAG tuning ---
    vector_search_top_k: int = 10          # candidates pulled from vector search
    final_results_count: int = 5           # candidates shown to the user after re-ranking
    embedding_dimensions: int = 768        # must match the Atlas vector index config

    # --- App ---
    app_name: str = "AI Tour Package Recommendation API"
    cors_allow_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
