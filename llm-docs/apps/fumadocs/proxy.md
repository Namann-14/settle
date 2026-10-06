# apps/fumadocs/proxy.ts

**Purpose:** Next.js proxy (middleware) that serves Markdown versions of docs pages to LLMs and tools.

**Key contents:** Rewrites `/docs/<path>.md` and requests that prefer Markdown (`Accept` negotiation) to `/llms.mdx/docs/<path>/content.md`.

**Depends on / used by:** Uses `docsRoute`/`docsContentRoute` from `src/lib/shared.ts`; target handled by `src/app/llms.mdx/docs/[[...slug]]/route.ts`.

**Decisions & caveats:** Named `proxy.ts` (Next 16's replacement for `middleware.ts`). Note it sits at the app root, not in `src/`.
