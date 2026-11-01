# apps/web/src/components/dashboard/standing.tsx

**Purpose:** Top of the Overview page: the net as one serif sentence and a two-column ledger, "Owed to you" facing "You owe", with a balance line underneath.

**Key contents:** `StandingSection` (header sentence + summary line, Record a payment / Add expense pills, the ledger, and its dialogs). Internal `Headline`, `LedgerColumn` (top 6 rows, "Show all N"), `SettleUpButton` (one button, or a per-group menu when a person spans groups), `remind()` and `LedgerSkeleton`. States: loading skeleton, error with retry, no groups (start a group / add a personal expense), all settled (one calm line), one empty column with its own message.

**Depends on / used by:** `hooks/useStanding`, `lib/balances` (`formatMoney`, `formatTotals`), `lib/people`, `expenses/expense-sheet`, `groups/create-group-dialog`, `settlements/record-settlement-dialog`, `@settle/ui` dropdown-menu and skeleton, `dashboard/panel` (`buttonClass`). Rendered by `app/dashboard/overview/page.tsx`.

**Decisions & caveats:** Rows are payments to make (the api's simplified transfers summed per person), not raw pairwise debts, so Settle up always records a payment the api would ask for; settlements belong to a group, hence the per-group menu. Remind uses the Web Share API and falls back to copying the text (Settle sends no email). On phones the columns stack with You owe first (CSS `order`). Serif only on the sentence, column totals and balance line; no stat tiles, eyebrows, entrance animation or hover lift (see `.impeccable/surfaces/src-app-dashboard-overview.md`). Mixed currencies show as "₹7,760 + $20" and the headline falls back to "Here's where you stand".
