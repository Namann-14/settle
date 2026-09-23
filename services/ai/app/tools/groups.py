from __future__ import annotations

from langchain_core.tools import tool
from langgraph.prebuilt import ToolRuntime

from app.core.errors import ApiError
from app.services.context import RequestContext


@tool
async def list_my_groups(runtime: ToolRuntime[RequestContext, dict]) -> str:
    """List the groups the current user belongs to.

    Call this before using any group_id in another tool — never guess a
    group_id from the conversation.
    """
    try:
        groups = await runtime.context.client().list_groups()
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: {e.detail} (status {e.status_code})"
    if not groups:
        return "The user isn't in any groups."
    lines = [f"{g['name']} (group_id: {g['id']}, currency: {g['default_currency']})" for g in groups]
    return "\n".join(lines)


@tool
async def get_group_members(
    runtime: ToolRuntime[RequestContext, dict],
    group_id: str,
) -> str:
    """List the members of a group by its UUID, with their names when known."""
    try:
        group = await runtime.context.client().get_group(group_id)
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: {e.detail} (status {e.status_code})"
    members = group.get("members", [])
    if not members:
        return "This group has no members."
    lines = [
        f"{m.get('user_name') or 'unknown name'} (user_id: {m['user_id']}, role: {m['role']})"
        for m in members
        if not m.get("removed_at")
    ]
    return "\n".join(lines)
