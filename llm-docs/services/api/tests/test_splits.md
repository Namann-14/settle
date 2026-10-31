# services/api/tests/test_splits.py

**Purpose:** Unit tests for expense split math and the create/update validation wiring.

**Key contents:** `_allocate` always sums to the amount and spreads leftover cents to the earliest rows; EQUAL/PERCENTAGE ignore client amounts and never lose a cent; percentages must total 100 and every row needs one; UNEQUAL must match to the cent; duplicate and empty splits rejected; group membership checks for caller, payer and split users; personal expenses can't include others; updates re-split existing people and reject non-member or foreign-group splits.

**Depends on / used by:** Tests `app/controllers/expense.py`, monkeypatching `group_repo` and `expense_repo` via `_FakeRepos`.

**Decisions & caveats:** No DB or Clerk: dummy `CLERK_*`/`DATABASE_URL` env vars are set before import only because `Settings()` needs them.
