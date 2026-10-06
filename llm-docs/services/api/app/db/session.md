# services/api/app/db/session.py

**Purpose:** Creates the SQLAlchemy engine and session factory.

**Key contents:** Normalises `postgres(ql)://` URLs to `postgresql+psycopg://`, builds the engine (`pool_size=10`, `max_overflow=10`, `pool_recycle=240`), installs query timing, and exports `SessionLocal` (no autoflush, no autocommit).

**Depends on / used by:** `core/config`, `core/timing`; used by `dependencies/database.py`, `db/migrate.py`, `main.py` warm-up.

**Decisions & caveats:** No `pool_pre_ping`: it costs a network round trip per checkout against remote Neon. Connections instead recycle after 240s, below Neon's 5-minute idle suspend. The pool size matches the dashboard's roughly 8 parallel requests. See decisions.md (dashboard performance).
