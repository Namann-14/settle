# apps/web/src/components/settlements/record-settlement-dialog.tsx

**Purpose:** Dialog for recording a payment between group members.

**Key contents:** `RecordSettlementDialog` takes a `SettlementPreset` (null = closed) and renders an inner form with group, payer, receiver, amount, date and note, submitting via `useCreateSettlement`. `RecordSettlementDialog` and `SettlementPreset` are a stable API.

**Depends on / used by:** Uses `useGroups`, `useCurrentUser`, forms/field helpers, `buttonClass`; opened from `settle-plan-card.tsx`, `settlements-page.tsx`, `groups/group-detail.tsx`, the overview standing section and the search palette.

**Decisions & caveats:** Inter semibold title (no serif in dialogs). Paired fields are two-column from `sm`, stacked on phones; buttons are 44px on phones. The inner form is keyed by the JSON of the preset so state resets when a new preset opens. Members list excludes removed members (`removed_at`).
