# apps/web/src/components/expenses/ai-quick-add.tsx

**Purpose:** Natural-language and voice expense entry bar that produces a draft.

**Key contents:** `AiQuickAdd` takes text (or a recorded voice clip up to 60 s), picks a group (default most recent), calls the draft-from-text/voice mutations and passes the `ExpenseDraft` to `onDraft`. Props (`onDraft`, `groupId`, `className`) are a stable API.

**Depends on / used by:** Uses `useDraftExpenseFromText`/`Voice` in `@/hooks/mutations`, `useGroups`, `buttonClass` from `dashboard/panel.tsx`; opens `expense-sheet.tsx` via callers (`expenses-page.tsx`, `groups/group-detail.tsx`, `spending/spending-overview.tsx`).

**Decisions & caveats:** Styled as an ordinary bordered surface (16px corners, hairline, no shadow) labelled "Settle AI" in words: no sparkle icon, no spinner, no pulsing record button (recording swaps to the danger button variant and sets `aria-pressed`). The AI only drafts; the user confirms in the sheet before anything is saved. Group defaults to the first group because the AI resolves names against that group's members. `pickedGroup` is `undefined` until the user picks and `""` for "No group"; collapsing both to `null` made "No group" snap back to the default. Voice uses MediaRecorder with feature detection, mic-permission error toast, auto-stop, and cleanup of timers/tracks on unmount. `groupId` prop locks it to one group. Controls are 44px tall on phones.
