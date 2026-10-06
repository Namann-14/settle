# services/api/app/core/timing.py

**Purpose:** Per-request timing and SQL statistics for spotting slow endpoints.

**Key contents:** `install_query_timing(engine)` hooks SQLAlchemy cursor events and `TimingMiddleware` records total time, DB time and query count, writing a `Server-Timing` header and one log line per request (e.g. `GET /spending/summary 200 530ms (db 514ms, 4 queries)`).

**Depends on / used by:** Installed from `db/session.py` and `main.py`.

**Decisions & caveats:** Stats live in a ContextVar holding a mutable dict, because sync routes run in a threadpool with a copied context and cannot rebind the var but can mutate the dict. The logger is a child of uvicorn's so lines appear at INFO. The Next.js proxy does not forward `Server-Timing` yet. Added as part of the performance work in decisions.md (no Redis).
