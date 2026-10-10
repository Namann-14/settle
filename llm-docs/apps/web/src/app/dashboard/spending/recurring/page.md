# apps/web/src/app/dashboard/spending/recurring/page.tsx

**Purpose:** Recurring expenses tab of the Spending section.

**Key contents:** Prefetches recurring rules and renders `RecurringPage`.

**Depends on / used by:** Uses `apps/web/src/lib/server-prefetch.tsx` and `components/spending/recurring-page`; related to `RecurringSync` in the dashboard layout.

**Decisions & caveats:** Recurring expenses are personal only and logged by an idempotent sync, not cron (decisions.md).
