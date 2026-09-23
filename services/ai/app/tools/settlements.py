from __future__ import annotations

from langchain_core.tools import tool
from langgraph.prebuilt import ToolRuntime

from app.core.errors import ApiError
from app.services.context import RequestContext


@tool
async def list_my_settlements(
    runtime: ToolRuntime[RequestContext, dict],
    limit: int = 50,
) -> str:
    """List recent settlements (payments already made to settle a debt) involving the user."""
    try:
        rows = await runtime.context.client().list_settlements(limit=min(limit, 100))
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: {e.detail} (status {e.status_code})"
    if not rows:
        return "No settlements found."
    shown = rows[:limit]
    lines = [
        f"{s['date']} | {s['amount']} {s['currency']} | paid_by {s['paid_by_id']} -> "
        f"received_by {s['received_by_id']} | note: {s.get('note') or '-'}"
        for s in shown
    ]
    footer = f"\n(showing {limit} of {len(rows)})" if len(rows) > limit else ""
    return "\n".join(lines) + footer
