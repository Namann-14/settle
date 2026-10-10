# services/api/scripts/reset_dev_data.py

**Purpose:** Dev utility that wipes all app data while keeping the schema.

**Key contents:** Deletes rows from all model tables in dependency order, keeps `alembic_version`, `checkpoint_migrations` and system categories, and truncates other public tables (ai-service chat and LangGraph data). Requires `--yes`.

**Depends on / used by:** Uses `app.db.base.Base` and `app.db.session.engine`; run with `uv run python -m scripts.reset_dev_data --yes`.

**Decisions & caveats:** Irreversible; never point at production. Users are recreated from Clerk on next sign-in.
