from __future__ import annotations

from langchain_core.tools import tool
from langgraph.prebuilt import ToolRuntime

from app.core.errors import ApiError
from app.services.balances import build_balances_response, compute_balances
from app.services.context import RequestContext


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


def _money(value) -> str:
    return f"{float(value):,.2f}"


async def _fetch_summary(ctx: RequestContext, month: str | None) -> dict | str:
    try:
        return await ctx.client().get_spending_summary(month)
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: {e.detail} (status {e.status_code})"


@tool
async def get_spending_summary(
    runtime: ToolRuntime[RequestContext, dict],
    month: str | None = None,
) -> str:
    """Get the user's spending for a calendar month: total, change vs last month,
    split into personal vs their share of group expenses, by category, top
    places, and income/savings.

    `month` is "YYYY-MM"; omit it for the current month. Amounts are the user's
    OWN share (a group dinner they split 4 ways counts as a quarter), which is
    what "how much did I spend" means. Prefer this over summing expenses.
    """
    data = await _fetch_summary(runtime.context, month)
    if isinstance(data, str):
        return data

    c = data["currency"]
    total, previous = float(data["total"]), float(data["previous_total"])
    change = f" ({(total - previous) / previous * 100:+.0f}% vs last month)" if previous > 0 else ""
    cats = ", ".join(f"{x['name']}: {_money(x['amount'])}" for x in data["by_category"] if float(x["amount"]) > 0)
    places = ", ".join(f"{m['name']}: {_money(m['amount'])}" for m in data["top_merchants"])
    lines = [
        f"Month {data['month']}: spent {_money(total)} {c}{change} across {data['expense_count']} expenses "
        f"({_money(data['personal_total'])} personal, {_money(data['group_share_total'])} share of group expenses).",
        f"By category: {cats or 'none'}.",
        f"Top places: {places or 'none'}.",
    ]
    if float(data["income_total"]) > 0:
        lines.append(f"Income {_money(data['income_total'])} {c}, net saved {_money(data['net'])} {c}.")
    if data["other_currencies"]:
        other = ", ".join(f"{_money(o['amount'])} {o['currency']}" for o in data["other_currencies"])
        lines.append(f"Not included (other currencies): {other}.")
    return "\n".join(lines)


@tool
async def get_budget_status(
    runtime: ToolRuntime[RequestContext, dict],
    month: str | None = None,
) -> str:
    """Check the user's monthly budgets: for the overall budget and each category
    budget, how much is spent, how much is left, and whether they are over.

    `month` is "YYYY-MM"; omit it for the current month. Use this for "am I
    over budget", "how much can I still spend on food", etc.
    """
    data = await _fetch_summary(runtime.context, month)
    if isinstance(data, str):
        return data

    c = data["currency"]

    def line(name: str, spent: float, budget: float) -> str:
        pct = spent / budget * 100
        state = f"OVER by {_money(spent - budget)}" if spent > budget else f"{_money(budget - spent)} left"
        return f"{name}: {_money(spent)} of {_money(budget)} {c} ({pct:.0f}%) - {state}"

    lines = []
    if data.get("overall_budget"):
        lines.append(line("Overall", float(data["total"]), float(data["overall_budget"])))
    for cat in data["by_category"]:
        if cat.get("budget"):
            lines.append(line(cat["name"], float(cat["amount"]), float(cat["budget"])))
    if not lines:
        return (
            "The user has no budgets set. They can add them under Spending > Budgets. "
            f"This month they have spent {_money(data['total'])} {c} so far."
        )
    return f"Budgets for {data['month']}:\n" + "\n".join(lines)
