# services/ai/app/main.py

**Purpose:** FastAPI app entry point for the AI service.

**Key contents:** Lifespan initialises the shared HTTP client and persistence (and closes them), CORS middleware, exception handlers for ApiError, CapabilityUnavailable (501) and OcrError (502), a health endpoint, and mounts the routers under `ai_route_prefix`.

**Depends on / used by:** Uses core/config, core/errors, db/persistence, routes, services/api_client.

**Decisions & caveats:** The health route and all routers are prefixed by `ai_route_prefix` since Vercel forwards the full public path.
