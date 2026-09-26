from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    CLERK_PUBLISHABLE_KEY: str
    DATABASE_URL: str

    # WhatsApp Cloud API bot. All optional: the webhook refuses to run until set.
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_VERIFY_TOKEN: str = ""
    WHATSAPP_APP_SECRET: str = ""
    WHATSAPP_BOT_NUMBER: str = ""
    WHATSAPP_GRAPH_VERSION: str = "v21.0"
    WHATSAPP_TIMEZONE: str = "Asia/Kolkata"

    # services/ai, called server-to-server with a shared key (no Clerk token)
    AI_SERVICE_URL: str = "http://localhost:8001"
    AI_ROUTE_PREFIX: str = ""
    INTERNAL_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()