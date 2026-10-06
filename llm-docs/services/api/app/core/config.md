# services/api/app/core/config.py

**Purpose:** Typed application settings loaded from environment and `.env`.

**Key contents:** `Settings` (pydantic-settings) with Clerk keys, `DATABASE_URL`, `RUN_MIGRATIONS_ON_STARTUP`, Telegram bot settings, `BOT_TIMEZONE` (default Asia/Kolkata), AI service URL/prefix and `INTERNAL_API_KEY`. Exports a singleton `settings`.

**Depends on / used by:** Used throughout api (`db/session`, `dependencies/auth`, `main`, telegram and AI clients, `alembic/env.py`). Template: `.env.example`.

**Decisions & caveats:** `AI_SERVICE_URL` accepts alias `BOT_AI_SERVICE_URL`, which wins; on Vercel env vars are project-wide and web already receives `AI_SERVICE_URL` from a service binding. Telegram and internal key settings default to empty, and the webhook refuses to run until set. `extra="ignore"` tolerates unrelated env vars.
