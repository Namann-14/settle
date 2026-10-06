# apps/web/src/components/dashboard/recurring-sync.tsx

**Purpose:** Invisible component that logs due recurring expenses once per dashboard session.

**Key contents:** `RecurringSync` calls the `useRecurringSync` mutation on mount and toasts how many expenses were logged.

**Depends on / used by:** Uses `@/hooks/mutations` which calls `POST /recurring/sync`. Mounted in the dashboard layout.

**Decisions & caveats:** Implements the 'no cron' decision: logging happens on app open, sending the user's local date. A ref guards against StrictMode double invocation; the API is idempotent and locks rules so multiple tabs are safe. Renders nothing.
