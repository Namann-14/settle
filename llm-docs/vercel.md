# vercel.json

**Purpose:** Vercel multi-service deployment config.

**Key contents:** Declares three services: `web` (Next.js in apps/web), `api` (FastAPI in services/api) and `ai` (FastAPI in services/ai), each with entrypoint and service bindings that inject `BACKEND_URL`, `AI_SERVICE_URL` and `API_SERVICE_URL`. Rewrites route `/webhooks/*` to api, `/ai/*` to ai, everything else to web.

**Depends on / used by:** Entrypoints are `app.main:app` in `services/api` and `services/ai`; Telegram webhook route lives in `routes/telegram.py`.

**Decisions & caveats:** Rewrite order matters: the catch-all to web is last. The function region was moved to `sin1` to sit next to the Neon database in Singapore (decisions.md); that is a project setting and may not appear in this file.
