from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings
from app.core.errors import ApiError

# One connection pool for the whole process. The caller's token is NEVER set on
# this client's default headers — that would leak one user's token into another
# user's in-flight request. It goes per-request in ApiClient._request instead.
_shared_client: httpx.AsyncClient | None = None


def init_http_client() -> httpx.AsyncClient:
    """Create the shared pool. Called from the FastAPI lifespan."""
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        _shared_client = httpx.AsyncClient(
            base_url=settings.api_service_url,
            timeout=httpx.Timeout(settings.api_request_timeout_s, connect=5.0),
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=10),
        )
    return _shared_client


async def close_http_client() -> None:
    global _shared_client
    if _shared_client is not None and not _shared_client.is_closed:
        await _shared_client.aclose()
    _shared_client = None


def get_http_client() -> httpx.AsyncClient:
    # LangGraph Studio and tests import graphs without running the lifespan, so
    # fall back to creating the pool on demand.
    return init_http_client()


def _safe_detail(resp: httpx.Response) -> str:
    try:
        body = resp.json()
    except Exception:
        return resp.text[:300] or resp.reason_phrase
    if isinstance(body, dict):
        detail = body.get("detail")
        if isinstance(detail, str):
            return detail
    return str(body)[:300]


class ApiClient:
    """Token-scoped view onto services/api.

    One instance per request. All permission enforcement happens upstream in
    api's controllers — this client just forwards the caller's Clerk token.
    """

    def __init__(self, token: str, client: httpx.AsyncClient | None = None) -> None:
        self._token = token
        self._client = client or get_http_client()

    async def _request(self, method: str, path: str, **kwargs: Any) -> Any:
        try:
            resp = await self._client.request(
                method,
                path,
                headers={"Authorization": f"Bearer {self._token}"},
                **kwargs,
            )
        except httpx.TimeoutException as err:
            raise ApiError(504, f"services/api timed out on {method} {path}") from err
        except httpx.RequestError as err:
            raise ApiError(502, f"cannot reach services/api: {err}") from err

        if resp.status_code >= 400:
            raise ApiError(resp.status_code, _safe_detail(resp))
        if resp.status_code == 204 or not resp.content:
            return None
        return resp.json()

    # ---- users

    async def get_me(self) -> dict:
        return await self._request("GET", "/users/me")

    # ---- expenses

    async def list_expenses(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        group_id: str | None = None,
    ) -> list[dict]:
        params: dict[str, Any] = {"skip": skip, "limit": min(limit, 100)}
        if group_id:
            params["group_id"] = group_id
        return await self._request("GET", "/expenses", params=params)

    async def list_all_expenses(
        self,
        *,
        group_id: str | None = None,
        max_items: int = 500,
    ) -> list[dict]:
        """Walk the pages — api caps limit at 100 per call."""
        out: list[dict] = []
        skip = 0
        while len(out) < max_items:
            page = await self.list_expenses(skip=skip, limit=100, group_id=group_id)
            if not page:
                break
            out.extend(page)
            if len(page) < 100:
                break
            skip += 100
        return out[:max_items]

    async def get_expense(self, expense_id: str) -> dict:
        return await self._request("GET", f"/expenses/{expense_id}")

    # ---- groups

    async def list_groups(self) -> list[dict]:
        return await self._request("GET", "/groups")

    async def get_group(self, group_id: str) -> dict:
        return await self._request("GET", f"/groups/{group_id}")

    # ---- categories

    async def list_categories(self) -> list[dict]:
        return await self._request("GET", "/categories")

    # ---- settlements

    async def list_settlements(self, *, skip: int = 0, limit: int = 100) -> list[dict]:
        return await self._request(
            "GET", "/settlements", params={"skip": skip, "limit": min(limit, 100)}
        )

    async def list_all_settlements(self, *, max_items: int = 500) -> list[dict]:
        out: list[dict] = []
        skip = 0
        while len(out) < max_items:
            page = await self.list_settlements(skip=skip, limit=100)
            if not page:
                break
            out.extend(page)
            if len(page) < 100:
                break
            skip += 100
        return out[:max_items]
