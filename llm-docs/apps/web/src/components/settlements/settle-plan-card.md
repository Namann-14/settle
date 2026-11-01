# apps/web/src/components/settlements/settle-plan-card.tsx

**Purpose:** "Settle AI" panel listing the suggested settle-up transfers, with reminder and record actions.

**Key contents:** `SettlePlanCard({ groupId?, onRecord, className? })` fetches a plan with `useSettlePlan(groupId)` and renders a normal `Panel`: header "Settle AI" with a Regenerate ghost button, the model's headline as plain text, then one row per transfer (initials, who pays whom, group, amount coloured by direction, Reminder and Record/Mark paid buttons). Reminder text expands inline with a copy button.

**Depends on / used by:** Uses `hooks/useAi.ts`, `dashboard/panel.tsx`, `formatMoney`, people helpers, `SettlementPreset`; used by `settlements-page.tsx` and `groups/group-detail.tsx` (keep props stable).

**Decisions & caveats:** Deliberately not a dark special-case card: no hardcoded colours, sparkle icon or serif headline (DESIGN.md "AI features"). Transfers are computed by the API; the model only writes headline and reminder text. AI queries are cached 10 minutes with no focus refetch. Error state offers a retry and notes the page's balances are still accurate. Plan rows give the name a 10rem basis so the actions wrap underneath in narrow columns instead of truncating the name.
