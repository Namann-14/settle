# services/api/app/db/enums.py

**Purpose:** Python enums backing the Postgres enum columns.

**Key contents:** `SplitType`, `GroupRole`, `InvitationStatus`, `AISourceType`, `AIDraftStatus`, `ChatRole`, `Frequency`; all `str` enums with uppercase values.

**Depends on / used by:** Models, controllers and schemas. `SplitType` and `AISourceType` are mirrored by `services/ai/app/schemas/common.py` and must be kept in sync.

**Decisions & caveats:** Changing a value requires an Alembic migration because they are native Postgres enum types.
