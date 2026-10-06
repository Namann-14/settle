# services/api/app/db/mixins.py

**Purpose:** Reusable SQLAlchemy column mixins.

**Key contents:** `UUIDMixin` (uuid4 primary key), `TimestampMixin` (`created_at`/`updated_at` with server-side `now()`), `SoftDeleteMixin` (indexed nullable `deleted_at` and `is_deleted`).

**Depends on / used by:** Most models in `app/models/`.

**Decisions & caveats:** Soft-deleted rows must be filtered explicitly in queries (spending and balances ignore them). The initial migration shows `groups.deleted_at` created as a naive DateTime, unlike this timezone-aware mixin.
