# apps/web/package.json

**Purpose:** Package manifest for the web app.

**Key contents:** Scripts `dev` (port 3001), `build`, `start`. Deps: Next 16, React 19, Clerk, TanStack Query, AI SDK (`ai`, `@ai-sdk/react`), Streamdown, motion, and internal `@settle/env`, `@settle/ui`, `@settle/config`.

**Depends on / used by:** Workspace member of the monorepo.

**Decisions & caveats:** Chat UI relies on the AI SDK UI message stream (see `src/app/api/chat/route.ts`).
