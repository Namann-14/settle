# services/ai/app/core/config.py

**Purpose:** Central settings for the AI service.

**Key contents:** Pydantic `Settings` (loaded from env/.env): Groq key and per-role model names, vision/OCR provider, LangSmith, api_service_url and timeout, internal_api_key, database_url, cors_origins, ai_route_prefix. Exports the `settings` singleton.

**Depends on / used by:** Used across llm/, db/, routes/, main.py. Documented in .env.example.

**Decisions & caveats:** Models are configurable per role so one can be swapped independently. Empty `database_url` means in-memory chats. `ai_route_prefix` exists because Vercel forwards the full public path (e.g. /ai/chat); leave empty locally. Empty `internal_api_key` disables /internal/* routes.
