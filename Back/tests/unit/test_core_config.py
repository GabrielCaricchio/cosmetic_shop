import pytest
from Back.core.config import Settings
from Back.core.exceptions import AppException

def test_settings_load_defaults():
    settings = Settings(
        DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/cosmetics_db",
        REDIS_URL="redis://localhost:6379/0",
        JWT_SECRET_KEY="supersecretkey_test_environment_12345",
    )
    assert settings.PROJECT_NAME == "Cosmetic Shop API"
    assert settings.PIX_EXPIRATION_SECONDS == 1800
    assert settings.CARD_EXPIRATION_SECONDS == 2400

def test_custom_app_exception():
    exc = AppException(message="Custom error", status_code=400, error_code="BAD_REQUEST")
    assert exc.status_code == 400
    assert exc.error_code == "BAD_REQUEST"
