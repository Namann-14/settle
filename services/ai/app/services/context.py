from __future__ import annotations

from dataclasses import dataclass

from app.services.api_client import ApiClient


@dataclass(frozen=True)
class RequestContext:
    """Run-scoped dependencies for a single request/graph run.

    NEVER put this in graph state — state gets checkpointed, and persisting a
    Clerk token into the checkpoint store would replay a stale token on later
    turns. This travels as LangGraph's `context` argument instead, which is
    never serialized.
    """

    bearer_token: str
    user_id: str
    user_name: str | None = None
    default_currency: str = "INR"

    def client(self) -> ApiClient:
        return ApiClient(self.bearer_token)


async def build_request_context(token: str) -> RequestContext:
    """Resolve a bearer token into a RequestContext.

    Calling /users/me here does double duty: it validates the token (a forged
    or expired token fails right here with an ApiError) and supplies the
    profile fields tools/prompts need, without services/ai needing its own
    Clerk client.
    """
    me = await ApiClient(token).get_me()
    return RequestContext(
        bearer_token=token,
        user_id=str(me["id"]),
        user_name=me.get("name"),
        default_currency=me.get("default_currency", "INR"),
    )
