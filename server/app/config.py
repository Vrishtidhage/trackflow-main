from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Bug Tracker API"
    app_description: str = "A bug tracking API made with FastAPI"

    database_url: str
    secret_key: str
    admin_email: str = "admin@trackflow.local"
    admin_password: str = "Admin@12345"

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
