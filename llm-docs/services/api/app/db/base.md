# services/api/app/db/base.py

**Purpose:** Declarative base class for all ORM models.

**Key contents:** `Base(DeclarativeBase)`, followed by `from app.models import *` at the bottom.

**Depends on / used by:** Every model subclasses `Base`; `alembic/env.py` uses `Base.metadata`.

**Decisions & caveats:** The wildcard import at the bottom (after `Base` is defined) is intentional: it registers every model on the metadata so Alembic autogenerate sees them, and it avoids a circular import because models import `Base` first.
