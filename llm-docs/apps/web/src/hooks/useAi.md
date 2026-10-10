# apps/web/src/hooks/useAi.ts

**Purpose:** Query hooks for LLM-backed group insight and settle plan.

**Key contents:** `useGroupInsight(groupId)` and `useSettlePlan(groupId?)` with shared `AI_QUERY` options (10 min stale, no retry, no focus refetch).

**Depends on / used by:** Uses `lib/api/ai`; used by `settle-plan-card.tsx`; invalidated via `mutations/invalidate.ts`.

**Decisions & caveats:** LLM calls are slow and costly, so results are cached aggressively and refreshed only when expenses or settlements change.
