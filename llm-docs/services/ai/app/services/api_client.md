# services/ai/app/services/api_client.py

**Purpose:** Async HTTP client for calling services/api on behalf of the current user.

**Key contents:** A process-wide shared `httpx.AsyncClient` (init/close/get helpers), `_safe_detail` for error text, and `ApiClient`, a per-request wrapper with methods for users, expenses (including paginated `list_all_expenses`), groups, categories, settlements, balances and spending summaries.

**Depends on / used by:** `core/config` (URL, timeout), `core/errors.ApiError`. Used by `services/context.py`, every tool in `tools/`, and the routes. The pool is opened in the FastAPI lifespan.

**Decisions & caveats:** The caller's token is set per request, never on the shared client's default headers, to avoid leaking one user's token into another's in-flight call. `get_http_client` lazily creates the pool because LangGraph Studio and tests skip the lifespan. Timeouts map to ApiError 504, connection failures to 502. Permissions are enforced by api, not here.
