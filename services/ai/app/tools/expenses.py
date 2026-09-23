from __future__ import annotations

from langchain_core.tools import tool
from langgraph.prebuilt import ToolRuntime

from app.core.errors import ApiError
from app.services.context import RequestContext


def _format_expense_table(rows: list[dict], limit: int = 50) -> str:
    if not rows:
        return "No expenses found."
    shown = rows[:limit]
    lines = ["date | description | amount | currency | group_id | expense_id"]
    for e in shown:
        lines.append(
            f"{e['date']} | {e['description']} | {e['amount']} | {e['currency']} | "
            f"{e.get('group_id') or '-'} | {e['id']}"
        )
    footer = ""
    if len(rows) > limit:
        footer = f"\n(showing {limit} of {len(rows)})"
    return "\n".join(lines) + footer


@tool
async def list_my_expenses(
    runtime: ToolRuntime[RequestContext, dict],
    group_id: str | None = None,
    limit: int = 50,
) -> str:
    """List the current user's recent expenses, optionally filtered to one group.

    Use this to answer questions about what the user spent, when, and on what.
    `group_id` must be a real UUID returned by `list_my_groups` — don't guess one.
    """
    try:
        rows = await runtime.context.client().list_expenses(limit=min(limit, 100), group_id=group_id)
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: {e.detail} (status {e.status_code})"
    return _format_expense_table(rows, limit=limit)


@tool
async def get_expense_details(
    runtime: ToolRuntime[RequestContext, dict],
    expense_id: str,
) -> str:
    """Get full details for one expense by its UUID, including its per-person splits."""
    try:
        e = await runtime.context.client().get_expense(expense_id)
    except ApiError as ex:
        if ex.status_code == 401:
            raise
        return f"error: {ex.detail} (status {ex.status_code})"
    splits = e.get("splits", [])
    split_lines = "\n".join(f"  - user {s['user_id']}: owes {s['amount_owed']}" for s in splits)
    return (
        f"{e['description']} — {e['amount']} {e['currency']} on {e['date']}\n"
        f"merchant: {e.get('merchant') or '-'} | paid by: {e['paid_by_id']} | "
        f"split_type: {e['split_type']}\n{split_lines}"
    )
