# services/ai/app/routes/settlements.py

**Purpose:** Builds a "settle up" plan: the fewest payments that clear the user's debts, with a headline and reminder messages.

**Key contents:** `POST /settlements/plan` (optional `group_id`). Fetches per-group balances/transfers from services/api concurrently, tags each transfer as incoming, outgoing, or others, sorts biggest first, and asks `chains/settle.write_plan_copy` for copy. Helpers `_money` and `_first` format display strings.

**Depends on / used by:** `chains/settle`, `services/context`, `schemas/settle`.

**Decisions & caveats:** Transfers and amounts come from api's `/groups/{id}/balances` (debt simplification done there in Decimal); the LLM only writes text and if it fails the plan still returns with plain text. Across all groups only the user's own payments are included; for a single group, other members' transfers are included as "others". Currency symbols come from a small hard-coded map.
