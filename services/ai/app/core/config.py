from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    groq_api_key: str = ""

    # model choice per role, so a slow/expensive model can be swapped in for one
    # job without touching the others
    groq_chat_model: str = "llama-3.3-70b-versatile"
    groq_extraction_model: str = "llama-3.3-70b-versatile"
    groq_whisper_model: str = "whisper-large-v3-turbo"

    # receipt OCR needs a vision model; Groq currently exposes none, so this stays
    # "none" until a provider is wired up (see app/llm/vision.py)
    vision_provider: str = "none"
    ocr_space_api_key: str = ""
    ocr_space_language: str = "eng"

    langsmith_tracing: bool = False
    langsmith_endpoint: str = ""
    langsmith_api_key: str = ""
    langsmith_project: str = "settle-ai"

    api_service_url: str = "http://localhost:8000"
    api_request_timeout_s: float = 30.0

    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]


settings = Settings()
