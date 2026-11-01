---
version: 1
slug: "src-app-dashboard-overview"
primary_target: "src/app/dashboard/overview"
related_targets: []
---

# Overview

Mode: Operate. Route `/dashboard/overview`.

Job: answer "where do I stand?" in seconds, often on a phone right after paying. Success: the visitor knows their net, who owes them, whom they owe, and can clear their side in one tap.

Content: people balances as payments to make (the api's simplified transfers involving the user, summed per person across groups), groups with the user's net per group, recent activity (expenses and settlements), this month's spending vs budget. No AI card, no "Ask Settle AI" button, no charts (Spending owns them). Typical world: 1-4 groups, 2-8 people.

States: page-shaped skeleton; one side empty gets a designed empty column; all settled collapses the ledger to one line; no groups gets one empty state leading to create group / add expense; per-panel error with retry.

Actions: Settle up opens the record-settlement dialog pre-filled (a menu per group when the person spans several groups). Remind shares a plain reminder via the Web Share API, falling back to copying it.

## Direction contract

THESIS: Overview is a two-column ledger, money owed to you facing money you owe, with the balance line underneath. It refuses the stat-tile dashboard (big number, small label, glow) and the equal-weight card grid.
OWN-WORLD: Calm Ledger tokens unchanged: mint paper ground, white ledger container with hairline rules, Banknote Green for owed and primary actions, Oxblood for owing, Instrument Serif only on the net sentence and the column totals, Inter 13-14px everywhere else, tabular figures.
STORY: The visitor reads one sentence for their net, scans who is on each side, taps Settle up on their side or Remind on the other, and glances at groups, activity and month spend below.
FIRST VIEWPORT: serif net sentence and one plain summary line top left, Record a payment and Add expense pills top right; the bordered ledger (Owed to you | You owe, serif totals in each column head, one row per person with initials, name, shared groups, amount, action; balance footer) fills the middle; Groups and Recent activity start side by side below. On phones the columns stack with You owe first.
FORM: Owed to you | You owe, position 3 of 7 on the ranked list. seed:2110d59eafebea81
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
