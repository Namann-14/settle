# apps/web/src/components/expenses/ai-quick-add.tsx

**Purpose:** Natural-language and voice expense entry bar that produces a draft.

**Key contents:** `AiQuickAdd` takes text (or a recorded voice clip up to 60 s), picks a group (default most recent), calls the draft-from-text/voice mutations and passes the `ExpenseDraft` to `onDraft`.

**Depends on / used by:** Uses `useDraftExpenseFromText`/`Voice` in `@/hooks/mutations`, `useGroups`; opens `expense-sheet.tsx` via callers (`expenses-page.tsx`, `groups/group-detail.tsx`).

**Decisions & caveats:** The AI only drafts; the user confirms in the sheet before anything is saved. Group defaults to the first group because the AI resolves names against that group's members. Voice uses MediaRecorder with feature detection, mic-permission error toast, auto-stop, and cleanup of timers/tracks on unmount. `groupId` prop locks it to one group.
