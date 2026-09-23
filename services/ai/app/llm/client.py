from app.core.config import settings
from langchain_groq import ChatGroq


def _chat_groq(model: str, temperature: float) -> ChatGroq:
    return ChatGroq(model=model, temperature=temperature, api_key=settings.groq_api_key)


def get_chat_model(temperature: float = 0.3) -> ChatGroq:
    """Model for the conversational chat agent — slightly warmer than extraction."""
    return _chat_groq(settings.groq_chat_model, temperature)


def get_extraction_model(temperature: float = 0.0) -> ChatGroq:
    """Model for structured extraction (categorize, from-text/receipt/voice).

    temperature=0 by default: extraction should be as deterministic as
    possible, not creative.
    """
    return _chat_groq(settings.groq_extraction_model, temperature)
