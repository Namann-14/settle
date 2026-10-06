# apps/web/src/types/spending.ts

**Purpose:** Types for the monthly spending summary response.

**Key contents:** `SpendingSummary` (totals, previous total, personal vs group share, overall budget, by_category, daily, trend, top_merchants, other_currencies, income_total, net) and `CategorySpend`.

**Depends on / used by:** `lib/api/spending.ts`, `hooks/useSpendingSummary.ts`.

**Decisions & caveats:** Totals are the user's own share in their default currency only; other currencies are listed separately in `other_currencies` and never converted (decisions.md). Money fields are decimal strings.
