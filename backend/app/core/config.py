import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = "your_openai_api_key_here"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL_NAME: str = "gpt-3.5-turbo"
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PROJECT_NAME: str = "HEMC"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://hemc_user:hemc_password@localhost:5432/hemc_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Gmail / Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GMAIL_REFRESH_TOKEN: str = ""
    EMAIL_FROM: str = "mosesjohnson706@gmail.com"
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
