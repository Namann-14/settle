# apps/web/src/types/ai.ts

**Purpose:** TypeScript types for the AI service responses.

**Key contents:** `ExpenseDraft` (with `CategorySuggestion`, `ResolvedParticipant`), `SettlePlan`/`PlannedTransfer`, and `GroupInsight` and related insight types.

**Depends on / used by:** `types/expense.ts` (`SplitType`); `lib/api/ai.ts`; mirrors Pydantic models in services/ai.

**Decisions & caveats:** Drafts are never saved by the AI. Participant resolution can be self, matched, unresolved or ambiguous; UI must resolve before submitting. Keep in sync with Python schemas by hand.
