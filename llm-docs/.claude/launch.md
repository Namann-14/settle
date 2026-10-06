# .claude/launch.json

**Purpose:** Claude Code launch configurations for running the three dev servers.

**Key contents:** Three configs: `web` (npm workspace dev, port 3001), `api` (uvicorn via uv, port 8000, reload on `app`), `ai` (uvicorn via uv, port 8001, reload on `app`).

**Depends on / used by:** Targets `apps/web`, `services/api`, `services/ai`. Ports match the defaults in `apps/web/.env.example` (`BACKEND_URL`, `AI_SERVICE_URL`).

**Decisions & caveats:** The AI service is pinned to `--workers 1`. Reload watches only the `app` dir.
