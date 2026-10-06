# apps/web/src/hooks/useSpendingSummary.ts

**Purpose:** React Query hook wrapping an API client call so components get cached server state.

**Key contents:** `useSpendingSummary(month?)` fetches the monthly spending summary, key `["spending-summary", month ?? "current"]`. Month is `YYYY-MM`.

**Depends on / used by:** `lib/api/spending.ts`, `types/spending.ts`; Spending overview and dashboard 'This month' card.

**Decisions & caveats:** The query key must match the same key in `src/lib/server-prefetch.tsx` (`serverQueries`), otherwise server-prefetched data is never used (see decisions.md, 'Faster first load'). The summary is the user's own share, in their default currency only (decisions.md).
