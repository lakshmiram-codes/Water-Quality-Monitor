from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://waterwatch:waterwatch@localhost:5432/waterwatch"

    SECRET_KEY: str = "insecure-dev-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    UPLOAD_DIR: str = "./uploads"

    EPA_API_KEY: str = ""
    EPA_API_BASE_URL: str = "https://www.waterqualitydata.us"
    WHO_API_BASE_URL: str = ""
    CPCB_API_KEY: str = ""
    CPCB_API_BASE_URL: str = ""

    PREDICTIVE_LOOKBACK_READINGS: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
