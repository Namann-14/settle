# services/api/alembic.ini

**Purpose:** Alembic configuration for the API database migrations.

**Key contents:** Mostly the stock generated template: `script_location` is `alembic/`, `prepend_sys_path = .`, standard logging setup. Post-write hooks are commented out.

**Depends on / used by:** `alembic/env.py`, which overrides `sqlalchemy.url`.

**Decisions & caveats:** The `sqlalchemy.url` here is a placeholder (`driver://user:pass@...`); the real URL comes from `settings.DATABASE_URL` in `env.py`. Run alembic from `services/api` so `prepend_sys_path` resolves `app`.
