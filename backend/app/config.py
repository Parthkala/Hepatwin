"""
app/config.py – centralised settings loaded from .env
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend/ directory (one level up from app/)
_env_path = Path(__file__).parent.parent / ".env"
load_dotenv(_env_path)


class Settings:
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite+aiosqlite:///./hepatwin.db"
    )

    # CORS
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5175,http://localhost:5176,http://localhost:3000",
        ).split(",")
    ]

    # Kalman filter defaults
    KALMAN_OBS_STD: float = float(os.getenv("KALMAN_OBS_STD", "0.2"))
    KALMAN_PROCESS_STD: float = float(os.getenv("KALMAN_PROCESS_STD", "0.1"))
    KALMAN_INIT_LEVEL_STD: float = float(os.getenv("KALMAN_INIT_LEVEL_STD", "1.0"))
    KALMAN_INIT_SLOPE_STD: float = float(os.getenv("KALMAN_INIT_SLOPE_STD", "0.5"))

    # Optional external AI key
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")


settings = Settings()
