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
    app_name: str = "Sahyadri Tours and Travels"
    base_url: str = "http://localhost:8000"
    admin_base_url: str = "http://localhost:8001"  # admin server port
    cors_allow_origins: list[str] = ["*"]
    admin_cors_allow_origins: list[str] = ["http://localhost:3001"]  # admin frontend URL

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # --- JWT Auth ---
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours
    cookie_secure: bool = False       # False for local HTTP development, set to True in production HTTPS
    cookie_samesite: str = "lax"      # SameSite policy for auth cookies

    # --- Admin Auth (separate from user auth) ---
    admin_email: str = "admin@sahyadritours.com"
    admin_password_hash: str = ""          # set in .env using generate_admin_hash.py
    admin_jwt_secret_key: str = ""         # MUST be different from jwt_secret_key
    admin_jwt_expire_minutes: int = 60 * 8 # 8 hours — shorter for security

    # --- Support ---
    whatsapp_number: str = "919999999999"  # default placeholder


settings = Settings()
