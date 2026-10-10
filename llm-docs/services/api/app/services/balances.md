# services/api/app/services/balances.py

**Purpose:** Pure logic for group balances and debt simplification.

**Key contents:** `compute_group_nets` (paid minus owed, adjusted by settlements, ignoring deleted expenses) and `simplify_debts` (greedy largest-debtor to largest-creditor matching).

**Depends on / used by:** Used by `controllers/group.py`; inputs from `repositories/expense.py` and `repositories/settlement.py`.

**Decisions & caveats:** Greedy approach gives at most n-1 transfers but is not guaranteed to be globally minimal. Amounts under one cent are ignored; results quantized to cents. Currency is not considered, so it assumes one currency per group.
