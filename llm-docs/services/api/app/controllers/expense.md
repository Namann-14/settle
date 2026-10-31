# services/api/app/controllers/expense.py

**Purpose:** Business logic for creating, reading, listing, updating and deleting expenses, personal or group.

**Key contents:** `_allocate` (largest-remainder split to the cent, ties to the earliest row); `_validate_splits` is authoritative: EQUAL and PERCENTAGE `amount_owed` are computed server-side (client amounts ignored), UNEQUAL must sum exactly to the amount, duplicate users are rejected; `_check_group_people` (caller, payer and split users must be active members); `_check_personal_people` (a personal expense involves only the current user). `create_expense` forces the caller as creator, defaults payer to the caller and rounds the amount to cents; `get_expense` allows creator, payer, split participants, or group members; `update_expense` re-checks membership and, when amount/split type/group/payer change without new splits, re-splits the existing people; delete is a soft delete.

**Depends on / used by:** `repositories/expense|group`, `schemas/expense|expense_split`, `db/enums.SplitType`. Used by `routes/expenses.py` and the Telegram controller. Tested by `tests/test_splits.py`.

**Decisions & caveats:** Splits always sum to the expense amount exactly, so balances never drift by a cent. A personal expense gets a single 100% split for its owner, which is what the "my spending" query sums (see decisions.md). Changing the amount of an UNEQUAL expense without sending new splits is rejected, since the old amounts no longer add up.
