# services/ai/app/tools/expense_actions.py

**Purpose:** The chat agent's write tools. Today that is `add_expense`, which creates an expense only after the user approves it.

**Key contents:**
- `add_expense(description, amount, date?, group_id?, participant_ids?, paid_by_id?, category?, merchant?)`.
- `_build` validates against the api (group, members, category name) and returns the POST /expenses payload plus a readable preview.
- `equal_splits` splits the amount evenly, giving leftover cents to the first people.
- `EXPENSE_APPROVAL` is the interrupt kind.

**Depends on / used by:** Uses `services/api_client` (get_group, list_categories, create_expense), `db/chat_store.record_expense`, LangGraph `interrupt`. Registered in `tools/__init__.py`. Its interrupt is surfaced by `routes/chat.py`.

**Decisions & caveats:**
- Flow: validate, then `interrupt({kind, tool_call_id, expense})`. On resume LangGraph re-runs the tool from the top, so validation repeats (reads only). The expense is created only if the answer is `{"approved": true}`.
- Bad arguments return an `error:` string before asking, so the user is never asked to approve something the api would reject.
- Splits are always EQUAL. The currency is the group's currency, or the user's default for personal expenses (product rule: default currency only).
- A personal expense can only be the user's own; splitting with someone needs a group.
- The created id is recorded on the thread (`runtime.state["conversation_id"]`) so restoring an earlier checkpoint deletes it.
- With no database, nothing is recorded, so rollback doesn't happen in in-memory mode.
