# services/api/tests/test_recurrence.py

**Purpose:** Unit tests for recurring-date math.

**Key contents:** Covers daily/weekly steps, month-end clamping and recovery, leap-year and interval handling, and yearly from Feb 29.

**Depends on / used by:** Tests `next_date` in `app/services/recurrence.py`.

**Decisions & caveats:** Pure date tests, no DB. They encode the anchor-day behaviour from decisions.md.
