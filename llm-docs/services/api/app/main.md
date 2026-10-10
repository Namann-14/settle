# services/api/app/main.py

**Purpose:** FastAPI application entrypoint for the API service.

**Key contents:** Lifespan that optionally runs migrations (`RUN_MIGRATIONS_ON_STARTUP`) and warms the DB connection pool; `TimingMiddleware`; CORS for localhost:3000/3001; `GET /health`; includes routers for users, expenses, groups, settlements, categories, budgets, incomes, recurring, spending and telegram.

**Depends on / used by:** `core/*`, `db/*`, `app/routes/*`. Run by uvicorn / Vercel.

**Decisions & caveats:** Migrations are not best effort (failure should stop startup), but pool warm-up is, since an unreachable database must not block boot. Warm-up opens `pool.size()` connections concurrently, held at once so each is distinct, to avoid TLS handshakes (about 1.5s each) on the first dashboard load. CORS lists only local origins; production traffic goes through the Next.js proxy. The `httpx` logger is held at WARNING because its INFO request lines include Telegram Bot API URLs, which carry the bot token.
