# services/ai/app/tools/settlements.py

**Purpose:** Chat tool listing recent settlement payments involving the user.

**Key contents:** `list_my_settlements` with a limit (capped at 100) and a "showing N of M" footer.

**Depends on / used by:** `services/context`, `core/errors`. Registered in `tools/__init__.py`.

**Decisions & caveats:** Nothing notable.
