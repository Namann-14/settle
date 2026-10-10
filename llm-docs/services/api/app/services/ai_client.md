# services/api/app/services/ai_client.py

**Purpose:** Server-to-server client from the API to the AI service for the Telegram bot.

**Key contents:** `Extracted` dataclass, `extract_text` and `extract_voice` posting to the AI service's `/internal/extract/*` routes, and `AIServiceError`.

**Depends on / used by:** Uses `core/config.py` settings (`AI_SERVICE_URL`, `AI_ROUTE_PREFIX`, `INTERNAL_API_KEY`); used by `controllers/telegram.py`.

**Decisions & caveats:** The bot has no Clerk session, so calls authenticate with the shared `X-Internal-Key`. 45 s timeout and errors are wrapped in `AIServiceError`. Calls are synchronous. `_url` appends `AI_ROUTE_PREFIX` only when the base URL does not already end with it: on Vercel `BOT_AI_SERVICE_URL` is `https://<domain>/ai` and the project-wide prefix is also `/ai`, and doubling it (`/ai/ai/...`) 404s every bot extraction.
