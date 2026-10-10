# services/ai/app/services/context.py

**Purpose:** Defines the per-request context (token, user id, name, currency) and builds it from a bearer token.

**Key contents:** frozen dataclass `RequestContext` with a `client()` factory, and `build_request_context(token)`, which calls `/users/me`.

**Depends on / used by:** `services/api_client.py`. Used by all user-facing routes and passed as LangGraph `context` to tools.

**Decisions & caveats:** Never store this in graph state: state is checkpointed and would persist a Clerk token that goes stale. LangGraph's `context` argument is not serialized. The `/users/me` call doubles as token validation.
