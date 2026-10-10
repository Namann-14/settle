# services/api/app/repositories/user.py

**Purpose:** Data access for users.

**Key contents:** Get by id, Clerk id, email (case-insensitive), batch by ids; create, update, delete.

**Depends on / used by:** Uses `models/user.py`, `schemas/user.py`; called from `routes/__init__.py` and `controllers/user.py`.

**Decisions & caveats:** Email lookup uses `lower()` on both sides, so it cannot use a plain index on `email`.
