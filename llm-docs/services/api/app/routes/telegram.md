# services/api/app/routes/telegram.py

**Purpose:** Telegram bot webhook endpoint.

**Key contents:** `POST /webhooks/telegram`: checks configuration and the secret-token header, parses the JSON update, and runs `controllers.telegram.handle_update` in a threadpool.

**Depends on / used by:** Uses `services/telegram.py`, `schemas/telegram.py` (`parse_update`), `controllers/telegram.py`. Vercel rewrites `/webhooks/*` to the api service (`vercel.json`).

**Decisions & caveats:** Always returns 200 once the secret checks out, even on bad bodies, because a non-2xx only causes Telegram to retry the same update; errors are reported to the user in chat. The handler is sync (DB + HTTP) so it runs off the event loop. Returns 503 if the bot is unconfigured, 403 on a bad secret.
