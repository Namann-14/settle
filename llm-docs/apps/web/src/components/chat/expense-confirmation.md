# apps/web/src/components/chat/expense-confirmation.tsx

**Purpose:** The Confirmation card shown when the assistant wants to add an expense.

**Key contents:** `ExpenseConfirmation` is an outline `Item` with a receipt icon, "Add {description}?", a one-line summary, and Deny / Approve buttons. `expenseAmount` (exact to the cent) and `expenseSummary` are also used by the Tool line once the user has answered.

**Depends on / used by:** `@settle/ui` item and button, `ExpensePreview` from `lib/chat-types`. Used by `chat/assistant-message.tsx`.

**Decisions & caveats:** Follows shadcn AI Elements' Confirmation pattern: Item + Button, and once answered the call renders as a Tool line instead. Amounts keep their cents because this is exactly what will be saved, unlike `formatMoney`, which rounds.
