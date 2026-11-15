# services/ai/package.json

**Purpose:** npm workspace manifest for the AI service, so `npm run dev` (Turborepo) starts it alongside web and api.

**Key contents:** Package `@settle/ai` with a `dev` script running `uv run uvicorn app.main:app --reload --reload-dir app --port 8001 --workers 1`.

**Depends on / used by:** Picked up by the root `services/*` workspace glob and the `turbo.json` `dev` task.

**Decisions & caveats:** Before this file existed, Turbo skipped the service, so the chat failed unless it was started by hand. `--workers 1` follows the local-run rule in CLAUDE.md. `--reload-dir app` keeps the reloader off `.venv`. There are no build, lint or check-types scripts, so those Turbo tasks are no-ops here. Python dependencies live in `pyproject.toml`.
