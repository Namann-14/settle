# apps/web/src/app/dashboard/overview/page.tsx

**Purpose:** Dashboard overview: balances, this-month spending, charts, groups, transactions, AI card and recent settlements.

**Key contents:** Prefetches expenses (100), settlements (100 and 8) and the spending summary, then lays out dashboard cards in a responsive 3-column grid.

**Depends on / used by:** Uses many `components/dashboard/*` cards and `apps/web/src/lib/server-prefetch.tsx`.

**Decisions & caveats:** Prefetching cuts the browser's on-load API calls from about 8 to 1 (decisions.md). The two settlements prefetches (limits 100 and 8) are separate cache keys used by different cards.
