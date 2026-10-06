# services/api/app/controllers/recurring.py

**Purpose:** Personal recurring-expense rules and the idempotent sync that materialises due occurrences.

**Key contents:** list/create/update/delete rules; `sync_recurring(db, user, today)` delegates to `services/recurrence.materialize_due`. Creation sets `next_run_date = start_date`, always an EQUAL split, `group_id=None`, payer is the creator.

**Depends on / used by:** `services/recurrence`, `controllers/category`, `repositories/recurring`, `schemas/recurring`. Called from `routes/recurring.py` (`POST /recurring/sync`).

**Decisions & caveats:** Recurring is personal-only in v1. Sync rejects a client date more than one day away from the server date to stop clock skew or pre-creating future expenses. Resuming a paused rule fast-forwards `next_run_date` rather than back-filling missed runs. Deleting a rule keeps already-created expenses. There is no cron job; see decisions.md.
