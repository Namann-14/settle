from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    CLERK_PUBLISHABLE_KEY: str
    DATABASE_URL: str
    # set on Vercel: apply pending Alembic migrations when the api starts
    RUN_MIGRATIONS_ON_STARTUP: bool = False

    # Telegram bot. All optional: the webhook refuses to run until set.
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_BOT_USERNAME: str = ""
    # sent back by Telegram in X-Telegram-Bot-Api-Secret-Token (set via setWebhook)
    TELEGRAM_WEBHOOK_SECRET: str = ""
    BOT_TIMEZONE: str = "Asia/Kolkata"

    # services/ai, called server-to-server with a shared key (no Clerk token)
    # BOT_AI_SERVICE_URL wins: on Vercel, env vars are project-wide and the web
    # service already gets AI_SERVICE_URL from its service binding.
    AI_SERVICE_URL: str = Field(
        default="http://localhost:8001",
        validation_alias=AliasChoices("BOT_AI_SERVICE_URL", "AI_SERVICE_URL"),
    )
    AI_ROUTE_PREFIX: str = ""
    INTERNAL_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()