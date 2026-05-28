from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "BirgeFund"
    app_env: Literal["local", "test", "production"] = "local"
    app_debug: bool = True

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    database_url: str = "postgresql+psycopg://birgefund:birgefund_password@postgres:5432/birgefund"

    redis_url: str = "redis://redis:6379/0"

    jwt_secret_key: str = "change_me_in_local_env"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    test_mode: bool = True
    default_language: str = "ru"
    available_languages: str = "ru,kg,en"

    upload_dir: str = "storage/uploads"
    max_image_size_mb: int = 5
    max_pdf_size_mb: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def available_languages_list(self) -> list[str]:
        return [item.strip() for item in self.available_languages.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
