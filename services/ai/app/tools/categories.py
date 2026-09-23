from __future__ import annotations

from langchain_core.tools import tool
from langgraph.prebuilt import ToolRuntime

from app.core.errors import ApiError
from app.services.context import RequestContext


@tool
async def list_my_categories(runtime: ToolRuntime[RequestContext, dict]) -> str:
    """List the expense categories available to the current user."""
    try:
        categories = await runtime.context.client().list_categories()
    except ApiError as e:
        if e.status_code == 401:
            raise
        return f"error: {e.detail} (status {e.status_code})"
    if not categories:
        return "No categories exist yet."
    return "\n".join(c["name"] for c in categories)
