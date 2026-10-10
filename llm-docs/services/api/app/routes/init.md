# services/api/app/routes/init.py

**Purpose:** Thin alias module re-exporting route helpers.

**Key contents:** Re-exports `get_current_db_user` and `handle_controller_errors` from `app.routes.__init__`.

**Depends on / used by:** Wraps `routes/__init__.py`; the routers import from `app.routes` directly, so this looks unused.

**Decisions & caveats:** Imports `app.routes.__init__` by its dunder module name, which is unusual and likely a leftover; prefer `from app.routes import ...`.
