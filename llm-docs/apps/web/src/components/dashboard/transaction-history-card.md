# apps/web/src/components/dashboard/transaction-history-card.tsx

**Purpose:** Overview table of the 8 most recent expenses.

**Key contents:** `TransactionHistoryCard` lists description, category name, date and amount in the expense's own currency, with loading, error and empty states.

**Depends on / used by:** Uses `useExpenses`, `useCategories`, `@settle/ui` table.

**Decisions & caveats:** Sorts the latest 100 expenses client-side by date. Amounts show the full expense amount, not the user's share.
