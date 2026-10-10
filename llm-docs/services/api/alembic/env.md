# services/api/alembic/env.py

**Purpose:** Alembic runtime environment: wires migrations to the app's database URL and SQLAlchemy metadata.

**Key contents:** Reads `settings.DATABASE_URL`, rewrites `postgresql://` / `postgres://` to `postgresql+psycopg://`, uses `Base.metadata` for autogenerate, and supports offline and online runs (NullPool online).

**Depends on / used by:** `app/core/config.py`, `app/db/base.py`, `app/models/user.py` (importing the models registers them on metadata), `alembic.ini`.

**Decisions & caveats:** `include_object` skips reflected tables that have no model. services/ai keeps its own tables in the same database (LangGraph checkpoints, `ai_chat_*`), and without this filter autogenerate would propose dropping them. The driver rewrite matters because Neon URLs use the plain `postgresql://` scheme but the app uses psycopg 3.
