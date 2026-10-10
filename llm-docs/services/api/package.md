# services/api/package.json

**Purpose:** npm workspace manifest for the API so Turborepo can run it.

**Key contents:** Package `@settle/api` with a `dev` script running `uv run uvicorn app.main:app --reload --port 8000`.

**Depends on / used by:** Picked up by root workspaces and `turbo.json` `dev` task.

**Decisions & caveats:** No build, lint or check-types scripts, so those Turbo tasks are no-ops for this package. Python dependencies live in `pyproject.toml`, not here.
