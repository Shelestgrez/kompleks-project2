from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Комплекс-проект API"
    secret_key: str = "change-me-in-production-use-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = f"sqlite:///{BASE_DIR / 'data.db'}"
    upload_dir: Path = BASE_DIR / "uploads"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    #: Дополнительные origin через запятую (например GitHub Pages: https://user.github.io)
    cors_origins_extra: str = ""

    @model_validator(mode="after")
    def _merge_cors_origins(self) -> "Settings":
        extra = [x.strip() for x in self.cors_origins_extra.split(",") if x.strip()]
        merged = list(dict.fromkeys([*self.cors_origins, *extra]))
        object.__setattr__(self, "cors_origins", merged)
        return self


settings = Settings()
