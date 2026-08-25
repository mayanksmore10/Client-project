from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_uri: str
    mongodb_db_name: str = "tours_db"
    mongodb_collection_name: str = "packages"
    vector_index_name: str = "package_vector_index"

    gemini_api_key: str
    gemini_embedding_model: str = "text-embedding-004"
    gemini_generation_model: str = "gemini-1.5-flash"

    vector_search_top_k: int = 10
    final_results_count: int = 5
    embedding_dimensions: int = 768

    app_name: str = "Sahyadri Tours and Travels"
    base_url: str = "http://localhost:8000"
    admin_base_url: str = "http://localhost:8001"
    cors_allow_origins: list[str] = ["*"]
    admin_cors_allow_origins: list[str] = ["http://localhost:3001"]
    debug: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    admin_email: str = "admin@sahyadritours.com"
    admin_password_hash: str = ""
    admin_jwt_secret_key: str = ""
    admin_jwt_expire_minutes: int = 60 * 8

    whatsapp_number: str = "919999999999"


settings = Settings()
