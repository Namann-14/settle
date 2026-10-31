# services/api/app/db/enums.py

**Purpose:** Python enums backing the Postgres enum columns.

**Key contents:** `SplitType`, `GroupRole`, `InvitationStatus` (PENDING, ACCEPTED, EXPIRED, CANCELLED, DECLINED), `AISourceType`, `AIDraftStatus`, `ChatRole`, `Frequency`; all `str` enums with uppercase values.

**Depends on / used by:** Models, controllers and schemas. `SplitType` and `AISourceType` are mirrored by `services/ai/app/schemas/common.py` and must be kept in sync.

**Decisions & caveats:** Changing a value requires an Alembic migration because they are native Postgres enum types (`DECLINED` came with `e2b7d4c91f05`; Postgres can't drop enum values, so its downgrade folds DECLINED rows into CANCELLED).
