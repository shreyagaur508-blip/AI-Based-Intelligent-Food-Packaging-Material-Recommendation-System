"""Application configuration settings using Pydantic and python-dotenv."""

import os
import json
from typing import List, Union
from dotenv import load_dotenv
from pydantic import BaseModel, field_validator

# Load environment variables from .env file
load_dotenv()


class Settings(BaseModel):
    """Core settings for the PackWise AI backend."""

    APP_NAME: str = os.getenv("APP_NAME", "PackWise AI Backend")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t", "yes")
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api")

    # Database connection URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./packwise.db")

    # CORS Allowed Origins
    CORS_ORIGINS: Union[List[str], str] = os.getenv(
        "CORS_ORIGINS",
        '["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000","http://127.0.0.1:3000"]',
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
