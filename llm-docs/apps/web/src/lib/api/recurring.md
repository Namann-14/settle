# apps/web/src/lib/api/recurring.ts

**Purpose:** Client for `/api/recurring`.

**Key contents:** `listRecurring`, `createRecurring`, `updateRecurring`, `deleteRecurring`, and `syncRecurring(today)` which POSTs the user's local date to `/api/recurring/sync`.

**Depends on / used by:** `types/recurring.ts`; `hooks/useRecurring.ts`; dashboard calls sync once per session.

**Decisions & caveats:** Sync is idempotent and replaces a cron job (decisions.md). The server rejects a client date more than a day off its own, so pass the local `todayIso()`. Deleting a rule keeps already-created expenses.
