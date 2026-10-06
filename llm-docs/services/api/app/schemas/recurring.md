# services/api/app/schemas/recurring.py

**Purpose:** Pydantic schemas for recurring expenses and sync.

**Key contents:** `RecurringCreate` (validates `end_date >= start_date`; interval 1-12), `RecurringUpdate` (includes `is_active` for pause/resume), `RecurringResponse`, `RecurringSyncRequest` (`today`), `RecurringSyncResponse` (`created` count).

**Depends on / used by:** Used by `routes/recurring.py`, `controllers/recurring.py`.

**Decisions & caveats:** Sync takes the client's local date so 'due today' matches the user's calendar; the server rejects dates more than a day from its own (decisions.md).
