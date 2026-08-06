from app.core.config import settings
from langchain_groq import ChatGroq


def get_chat_model(model: str = "llama-3.3-70b-versatile", temperature: float = 0.0) -> ChatGroq:
    return ChatGroq(model=model, temperature=temperature, api_key=settings.groq_api_key)