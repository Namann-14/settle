from __future__ import annotations

from groq import AsyncGroq

from app.core.config import settings

_client: AsyncGroq | None = None


def _get_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=settings.groq_api_key)
    return _client


async def transcribe_audio(
    *,
    filename: str,
    audio_bytes: bytes,
    language: str | None = None,
    prompt: str | None = None,
) -> str:
    """Transcribe audio via Groq's Whisper endpoint.

    `prompt` is a genuinely useful lever here: passing the user's category
    names / group member names biases transcription toward that vocabulary
    (proper nouns Whisper would otherwise mangle).
    """
    client = _get_client()
    kwargs: dict = {
        "model": settings.groq_whisper_model,
        "file": (filename, audio_bytes),
        "response_format": "text",
    }
    if language:
        kwargs["language"] = language
    if prompt:
        kwargs["prompt"] = prompt
    result = await client.audio.transcriptions.create(**kwargs)
    return result if isinstance(result, str) else result.text
