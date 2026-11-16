from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Cosmetic Shop API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/cosmetics_db"
    DATABASE_READ_URL: Optional[str] = None

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security & JWT
    JWT_SECRET_KEY: str = "supersecret_default_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Business rules (TTL)
    PIX_EXPIRATION_SECONDS: int = 1800  # 30 minutes
    CARD_EXPIRATION_SECONDS: int = 2400  # 40 minutes

    # WhatsApp support
    WHATSAPP_SUPPORT_PHONE: str = "5511999999999"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
