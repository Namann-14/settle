"""Chat tools that change data. Each one pauses the graph for the user's
approval (a LangGraph interrupt) before it writes anything.

How a write flows:
  1. The model calls the tool. It validates the arguments against the api
     (group, members, category) so the user is never asked to approve
     something that can't be created.
  2. It calls `interrupt()` with a preview of the expense. The stream ends and
     the web shows a Confirmation card (routes/chat.py emits the interrupt as
     an `approval_request` event).
  3. The user's answer resumes the graph (`Command(resume=...)`). LangGraph
     re-runs the tool from the top, `interrupt()` now returns the answer, and
     the expense is created only if it was approved.

Every created expense is recorded against its chat thread (chat_store), so
restoring an earlier checkpoint can delete the expenses added after it.
"""

from __future__ import annotations

from datetime import date as date_type
from decimal import ROUND_DOWN, Decimal

from langchain_core.tools import tool
from langgraph.prebuilt import ToolRuntime
from langgraph.types import interrupt

from app.core.errors import ApiError
from app.db import chat_store
from app.services.context import RequestContext

CENT = Decimal("0.01")

# The interrupt payload's `kind`, so routes/chat.py knows how to present it.
EXPENSE_APPROVAL = "expense_approval"


class _Invalid(Exception):
    """Arguments that can't become an expense; the message goes to the model."""


def equal_splits(amount: Decimal, user_ids: list[str]) -> list[dict]:
    """Split `amount` equally, giving leftover cents to the first people so the
    shares add up exactly (the api rejects splits that don't)."""
    share = (amount / len(user_ids)).quantize(CENT, rounding=ROUND_DOWN)
    leftover = int((amount - share * len(user_ids)) / CENT)
    return [
        {"user_id": uid, "amount_owed": str(share + (CENT if i < leftover else 0))}
        for i, uid in enumerate(user_ids)
    ]


async def _build(
    ctx: RequestContext,
    *,
    description: str,
    amount: float,
    date: str | None,
    group_id: str | None,
    participant_ids: list[str] | None,
    paid_by_id: str | None,
    category: str | None,
    merchant: str | None,
) -> tuple[dict, dict]:
    """(payload for POST /expenses, human-readable preview)."""
    client = ctx.client()
    total = Decimal(str(amount)).quantize(CENT)
    if total <= 0:
        raise _Invalid("amount must be greater than 0")
    when = date or date_type.today().isoformat()
    try:
        date_type.fromisoformat(when)
    except ValueError as err:
        raise _Invalid(f"date must be YYYY-MM-DD, got {when!r}") from err

    names = {ctx.user_id: "You"}
    group_name = None
    currency = ctx.default_currency
    if group_id:
        group = await client.get_group(group_id)
        group_name = group["name"]
        currency = group.get("default_currency") or currency
        members = [m for m in group.get("members", []) if not m.get("removed_at")]
        for m in members:
            if m["user_id"] != ctx.user_id:
                names[m["user_id"]] = m.get("user_name") or "Unknown member"
        people = participant_ids or [m["user_id"] for m in members]
        payer = paid_by_id or ctx.user_id
        unknown = [p for p in [*people, payer] if p not in names]
        if unknown:
            raise _Invalid(
                f"not members of this group: {', '.join(unknown)}. "
                "Use user_ids from get_group_members."
            )
    else:
        people = [ctx.user_id]
        payer = ctx.user_id
        if (participant_ids and set(participant_ids) != {ctx.user_id}) or (
            paid_by_id and paid_by_id != ctx.user_id
        ):
            raise _Invalid(
                "a personal expense can only be the user's own. To split it with "
                "other people, add it to a group (group_id)."
            )
    people = list(dict.fromkeys(people))  # dedupe, keep order

    category_id = category_name = None
    if category:
        categories = await client.list_categories()
        match = next((c for c in categories if c["name"].lower() == category.lower()), None)
        if match is None:
            raise _Invalid(
                f"no category named {category!r}. Use a name from list_my_categories, "
                "or leave it out."
            )
        category_id, category_name = str(match["id"]), match["name"]

    splits = equal_splits(total, people)
    payload = {
        "description": description.strip(),
        "merchant": merchant,
        "amount": str(total),
        "currency": currency,
        "date": when,
        "split_type": "EQUAL",
        "group_id": group_id,
        "category_id": category_id,
        "paid_by_id": payer,
        "splits": splits,
    }
    preview = {
        "description": payload["description"],
        "merchant": merchant,
        "amount": str(total),
        "currency": currency,
        "date": when,
        "group": group_name,
        "paid_by": names[payer],
        "category": category_name,
        "splits": [{"name": names[s["user_id"]], "amount": s["amount_owed"]} for s in splits],
    }
    return payload, preview


@tool
async def add_expense(
    runtime: ToolRuntime[RequestContext, dict],
    description: str,
    amount: float,
    date: str | None = None,
    group_id: str | None = None,
    participant_ids: list[str] | None = None,
    paid_by_id: str | None = None,
    category: str | None = None,
    merchant: str | None = None,
) -> str:
    """Add an expense for the user. The user is shown the details and must
    approve before anything is saved, so call this directly once you know the
    amount and what it was for; don't ask "shall I add it?" first.

    - amount: the full bill, in the group's currency (or the user's default
      currency for a personal expense).
    - date: YYYY-MM-DD; leave out for today.
    - group_id: a real group UUID from list_my_groups, to split the expense in
      that group. Leave out for a personal expense (only the user's own spend).
    - participant_ids: user_ids from get_group_members to split equally between;
      leave out to split between every group member.
    - paid_by_id: who paid, a user_id from get_group_members; leave out if the
      user paid.
    - category: a category name from list_my_categories; leave out if unsure.

    Add one expense per call. If the user declines, don't add it again unless
    they ask.
    """
    ctx = runtime.context
    try:
        payload, preview = await _build(
            ctx,
            description=description,
            amount=amount,
            date=date,
            group_id=group_id,
            participant_ids=participant_ids,
            paid_by_id=paid_by_id,
            category=category,
            merchant=merchant,
        )
    except _Invalid as e:
        return f"error: {e}"
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: {e.detail} (status {e.status_code})"

    answer = interrupt(
        {"kind": EXPENSE_APPROVAL, "tool_call_id": runtime.tool_call_id, "expense": preview}
    )
    if not (isinstance(answer, dict) and answer.get("approved")):
        return "The user declined. The expense was not added."

    try:
        created = await ctx.client().create_expense(payload)
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: the expense could not be added: {e.detail} (status {e.status_code})"
    await chat_store.record_expense(runtime.state["conversation_id"], str(created["id"]))
    where = f" in {preview['group']}" if preview["group"] else ""
    return (
        f"Added {preview['description']}: {preview['amount']} {preview['currency']} on "
        f"{preview['date']}{where}. (expense_id: {created['id']})"
    )
