# apps/web/src/components/settlements/settle-plan-card.tsx

**Purpose:** Dark 'AI' card showing suggested settle-up transfers with copy and reminder helpers.

**Key contents:** Fetches a plan with `useSettlePlan(groupId)`, shows loading/error states, a refresh button, and the planned transfers with actions that seed the record-settlement dialog.

**Depends on / used by:** Uses `hooks/useAi.ts`, `formatMoney`, people helpers, `SettlementPreset`; used by the settlements page.

**Decisions & caveats:** Transfers are computed by the API; the model only writes headline and reminder text (per in-file comment). AI queries are cached 10 minutes with no focus refetch.
