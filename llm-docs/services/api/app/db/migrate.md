# services/api/app/db/migrate.py

**Purpose:** Applies pending Alembic migrations programmatically at API startup.

**Key contents:** `upgrade_to_head()` takes a Postgres advisory lock (`pg_advisory_lock`), runs `alembic upgrade head`, then releases the lock.

**Depends on / used by:** `db/session.engine`, `alembic.ini`; called from the `main.py` lifespan when `RUN_MIGRATIONS_ON_STARTUP` is true.

**Decisions & caveats:** Exists because production DATABASE_URL on Vercel is a Sensitive env var that cannot be read back to migrate by hand. The advisory lock serialises concurrent cold starts so the second finds nothing to do. Migration failure is not swallowed, since serving an out-of-date schema breaks queries. Sets `config.attributes["configure_logger"] = False` so env.py leaves the app's logging alone, and holds the `alembic` logger at WARNING during the upgrade to drop the INFO chatter (plugin setup, dialect impl) Alembic prints on every cold start.
