# services/api/app/dependencies/database.py

**Purpose:** FastAPI dependency yielding a DB session per request.

**Key contents:** `get_db` generator that opens `SessionLocal()` and always closes it.

**Depends on / used by:** `db/session.py`; injected into route handlers.

**Decisions & caveats:** Does not commit or roll back; repositories handle commits.
