# apps/web/src/hooks/mutations/useDraftExpense.ts

**Purpose:** Mutations that ask the AI to draft an expense from text or voice.

**Key contents:** `useDraftExpenseFromText` and `useDraftExpenseFromVoice` (audio Blob), each with optional group id.

**Depends on / used by:** Uses `lib/api/ai`; used by the AI quick-add UI.

**Decisions & caveats:** No cache invalidation: drafts are previews and the user confirms before saving.
