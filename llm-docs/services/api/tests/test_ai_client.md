# services/api/tests/test_ai_client.py

**Purpose:** Unit tests for the API's client to the AI service.

**Key contents:** Parametrised check that `_url` builds `/internal/...` URLs correctly for local (no prefix), bare-domain plus `/ai` prefix, and base URLs that already end in `/ai` (with or without a trailing slash).

**Depends on / used by:** Tests `app/services/ai_client.py`, monkeypatching `AI_SERVICE_URL` and `AI_ROUTE_PREFIX` on `core/config.settings`.

**Decisions & caveats:** Guards the `/ai/ai/...` regression that broke Telegram extraction on Vercel. Sets dummy env vars before imports because `Settings()` is required at import time.
