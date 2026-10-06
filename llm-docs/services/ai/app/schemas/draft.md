# services/ai/app/schemas/draft.py

**Purpose:** Models for the draft expense the AI service returns for user confirmation.

**Key contents:** `FromTextRequest` (text, optional group_id), `ResolvedParticipant` (raw name, user_id, resolution of self/matched/unresolved/ambiguous, candidates), and `ExpenseDraft` (amount, currency, description, merchant, date, category, split type, payer, participants, confidence, warnings, transcript, raw_text).

**Depends on / used by:** `schemas/categorize`, `schemas/common`; produced by `services/draft_builder.py`, returned by `routes/expenses.py`.

**Decisions & caveats:** `ExpenseDraft` maps roughly 1:1 onto services/api's `ExpenseCreate` minus items needing human confirmation. The AI service never creates the expense; the frontend fills gaps and POSTs it. Amount and date may be null if unstated.
