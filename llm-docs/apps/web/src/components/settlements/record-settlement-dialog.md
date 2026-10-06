# apps/web/src/components/settlements/record-settlement-dialog.tsx

**Purpose:** Dialog for recording a payment between group members.

**Key contents:** `RecordSettlementDialog` takes a `SettlementPreset` (null = closed) and renders an inner form with group, payer, receiver, amount, date and note, submitting via `useCreateSettlement`.

**Depends on / used by:** Uses `useGroups`, `useCurrentUser`, forms/field helpers; opened from `settle-plan-card.tsx` and `settlements-page.tsx`.

**Decisions & caveats:** The inner form is keyed by the JSON of the preset so state resets when a new preset opens. Members list excludes removed members (`removed_at`).
