# package.json

**Purpose:** Root npm workspace manifest for the monorepo.

**Key contents:** Workspaces `apps/*`, `services/*`, `packages/*`; Turbo scripts (`dev`, `build`, `check-types`, `dev:web`), Vercel deploy/env-sync scripts (`env:preview`, `env:production` via `scripts/sync-vercel-env.ts`); deps on `@settle/env`, zod, dotenv; dev deps turbo, tsx, typescript 6, vercel.

**Depends on / used by:** `turbo.json`, `packages/*`, `scripts/sync-vercel-env.ts`.

**Decisions & caveats:** `type: module`. `@next/swc-darwin-arm64` is an optional dependency for Apple Silicon. Package manager pinned to npm 11.16.0.
