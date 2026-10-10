# services/api/alembic/script.py.mako

**Purpose:** Mako template Alembic uses to generate new migration files.

**Key contents:** Standard template: docstring header, revision identifiers, empty `upgrade()` and `downgrade()` filled from autogenerate output.

**Depends on / used by:** `alembic revision` creates files in `alembic/versions/` from it.

**Decisions & caveats:** Unmodified stock template.
