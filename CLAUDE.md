# Settle

Personal expense tracker with groups and settlements, plus an AI chat/expense-extraction assistant and a Telegram bot. npm + Turborepo monorepo with a Next.js frontend and two Python FastAPI services.

## Layout

| Path | What |
| --- | --- |
| `apps/web` | Next.js 16 / React 19 app (port 3001). Clerk auth, TanStack Query, AI SDK chat UI, Tailwind 4. |
| `apps/fumadocs` | Public docs site (Fumadocs, serves `llms.txt`). |
| `services/api` | FastAPI + SQLAlchemy 2 + Alembic + psycopg 3 (port 8000). Source of truth for data and permissions. |
| `services/ai` | FastAPI + LangGraph (port 8001). Groq models, `chat_agent` and `expense_extraction_agent`. Calls `services/api` on behalf of the user. |
| `packages/ui` | Shared shadcn primitives (`@settle/ui`). New shadcn components go here, not in the app. |
| `packages/env` | `@settle/env` t3-env package (currently a stub). |
| `packages/config` | Shared TS config. |
| `scripts/sync-vercel-env.ts` | Pushes env vars to Vercel (`npm run env:preview` / `env:production`). |

## Reference docs

`llm-docs/` mirrors the repo: one short doc per source/config file (Purpose, Key contents, Depends on, Decisions & caveats). **Read the matching doc before editing a file, and update it in the same change** (create/rename/delete included). Path rule: strip the extension and add `.md` (`apps/web/src/proxy.ts` -> `llm-docs/apps/web/src/proxy.md`; `package.json` -> `llm-docs/package.md`; dotfiles keep their name: `.gitignore.md`). Excluded: lockfiles, README/LICENSE, gitignored files, `.agents/skills/**`. See `llm-docs/README.md`.

`llm-docs/decisions.md` is the running product/architecture decision log. Append new decisions under a dated heading.

## Commands

```bash
npm run dev            # turbo: all services
npm run dev:web        # web only
npm run build
npm run check-types
npm run env:preview    # sync env to Vercel (also env:production)
npm run deploy         # vercel deploy (deploy:prod for production)

# Python services (run from repo root)
uv --directory services/api run uvicorn app.main:app --reload --port 8000
uv --directory services/ai run uvicorn app.main:app --reload --port 8001 --workers 1
uv --directory services/api run pytest
uv --directory services/api run alembic upgrade head
```

Only `web` has real build scripts; `services/*/package.json` just wrap `dev`, so Turbo `build`/`lint`/`check-types` are no-ops for them. Python deps live in each `pyproject.toml`.

## Architecture

- **Request flow:** browser -> Next route handlers (`apps/web/src/app/api/**`) -> `services/api` or `services/ai`. Route handlers use `lib/backend.ts` (`backendFetch`) and `lib/ai.ts` (`aiFetch`) to forward the Clerk token. CORS on the API only allows localhost; production goes through the Next proxy.
- **Auth:** Clerk. `apps/web/src/proxy.ts` (Next 16's middleware name) protects `/dashboard`. `services/api` verifies tokens in `dependencies/auth.py`; `services/ai` forwards the user token to api and never verifies it itself.
- **API layering:** `routes` -> `controllers` -> `repositories` -> `models`, with `schemas` for pydantic. Repositories commit; `get_db` does not.
- **AI service:** `agents/` (LangGraph graphs), `tools/` (call api via `services/api_client.py`), `llm/`, `prompts/`, `chains/`. Shares the Neon database with api (LangGraph checkpoints, `ai_chat_*` tables). Empty `database_url` means in-memory chats.
- **Data fetching in web:** hooks in `src/hooks/*` (mutations in `hooks/mutations`). Server components prefetch via `lib/server-prefetch.tsx`; its query keys must match the hooks exactly or the prefetch is ignored.
- **Deployment:** Vercel multi-service (`vercel.json`): `web`, `api`, `ai`. Rewrites: `/webhooks/*` -> api, `/ai/*` -> ai, everything else -> web (catch-all stays last). Region `sin1` next to the Singapore Neon DB.

## Gotchas

- **Migrations:** `alembic/env.py` filters out reflected tables without models so autogenerate doesn't drop the AI service's tables. Migration `5b1e0c7d9a21` (category merge) is irreversible. Neon URLs are rewritten to `postgresql+psycopg://`.
- **Env vars:** `BACKEND_URL`, `AI_SERVICE_URL`, `AI_ROUTE_PREFIX` are read straight from `process.env` in web (no validation). Service-binding URLs may end in `/`; strip it. `AI_ROUTE_PREFIX` is `/ai` on Vercel, empty locally. Env is project-wide on Vercel, so `BOT_AI_SERVICE_URL` overrides `AI_SERVICE_URL` in api.
- **Telegram:** the webhook refuses to run until bot token, secret and `INTERNAL_API_KEY` are set. `services/telegram.call` swallows failures on purpose so Telegram doesn't retry. Messages are HTML, so escape user text; callback data max 64 bytes.
- **Product rules** (see `decisions.md`): spending is the user's share only, default currency only, recurring expenses sync idempotently with no cron, 12 seeded system categories.
- **AI service:** never put a user token on the shared httpx client's default headers; set it per request. Run with `--workers 1` locally.
- `services/api/main.py` is an unused `uv init` placeholder; the real app is `app/main.py`.
- Perf work is tracked in decisions.md (no Redis). `TimingMiddleware` logs per-request time, DB time and query count.
