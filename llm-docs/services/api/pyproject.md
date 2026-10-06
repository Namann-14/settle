# services/api/pyproject.toml

**Purpose:** Python project config for the API service.

**Key contents:** Requires Python >= 3.11; dependencies include FastAPI, SQLAlchemy 2, Alembic, psycopg 3, httpx, pydantic-settings and the Clerk backend SDK; pytest dev group with `pythonpath` and `testpaths` set.

**Depends on / used by:** Used by `uv`; tests in `tests/`.

**Decisions & caveats:** Placeholder description and a `readme` entry that may not exist. psycopg 3 (binary) is the DB driver. `pythonpath = ['.']` lets tests import `app`.
