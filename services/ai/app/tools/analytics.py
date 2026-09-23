from __future__ import annotations

from langchain_core.tools import tool
from langgraph.prebuilt import ToolRuntime

from app.core.errors import ApiError
from app.services.balances import build_balances_response, compute_balances
from app.services.context import RequestContext
from app.services.insights import compute_summary


async def _build_names_by_id(client) -> dict[str, str | None]:
    names: dict[str, str | None] = {}
    for group in await client.list_groups():
        for member in group.get("members", []):
            names[str(member["user_id"])] = member.get("user_name")
    return names


@tool
async def get_my_balances(runtime: ToolRuntime[RequestContext, dict]) -> str:
    """Compute who owes the user money and who the user owes, across all groups.

    This is the authoritative source for "how much do I owe" / "who owes me"
    questions — prefer this over manually summing expenses yourself.
    """
    ctx = runtime.context
    client = ctx.client()
    try:
        expenses = await client.list_all_expenses()
        settlements = await client.list_all_settlements()
        names = await _build_names_by_id(client)
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: {e.detail} (status {e.status_code})"

    net = compute_balances(expenses, settlements, me_id=ctx.user_id)
    if not net:
        return "You're all settled up — no outstanding balances."

    resp = build_balances_response(net, currency=ctx.default_currency, names_by_id=names)
    lines = [
        f"{b.counterparty_name or b.counterparty_id}: "
        f"{'owes you' if b.direction == 'owes_you' else 'you owe'} {b.net_amount} {resp.currency}"
        for b in resp.balances
    ]
    return "\n".join(lines)


@tool
async def get_spending_summary(
    runtime: ToolRuntime[RequestContext, dict],
    days: int = 30,
) -> str:
    """Get a spending summary (total, by category, trend) for the last N days."""
    ctx = runtime.context
    client = ctx.client()
    try:
        expenses = await client.list_all_expenses()
        categories = await client.list_categories()
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: {e.detail} (status {e.status_code})"

    categories_by_id = {str(c["id"]): c["name"] for c in categories}
    summary = compute_summary(
        expenses,
        categories_by_id=categories_by_id,
        groups_by_id={},
        days=days,
        currency=ctx.default_currency,
    )
    by_cat = ", ".join(f"{c.category_name}: {c.total}" for c in summary.by_category[:5])
    return (
        f"Total spent in the last {days} days: {summary.total_spent} {summary.currency} "
        f"across {summary.expense_count} expenses (daily avg {summary.daily_average:.2f}). "
        f"By category: {by_cat or 'none'}."
    )
