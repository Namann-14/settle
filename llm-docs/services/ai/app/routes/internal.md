# services/ai/app/routes/internal.py

**Purpose:** Server-to-server extraction endpoints used by services/api for the Telegram expense bot.

**Key contents:** `POST /internal/extract/text` (text to `ExtractedExpense`) and `POST /internal/extract/voice` (audio upload plus JSON `context` form field; transcribes, then extracts). `require_internal_key` guards the whole router via the `X-Internal-Key` header.

**Depends on / used by:** `chains/extraction`, `llm/audio`, `core/config` (`internal_api_key`). Called by `services/api/app/controllers/telegram.py`.

**Decisions & caveats:** The bot has no Clerk session, so these routes skip `build_request_context`; the caller supplies categories, name, currency and today's date. The shared key is the only trust boundary, compared with `hmac.compare_digest`, and an unset key locks the routes (fails closed). Transcription is biased with the user's category names; empty transcripts return a zero-confidence empty extraction rather than an error.
