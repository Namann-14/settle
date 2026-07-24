from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    CLERK_PUBLISHABLE_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()