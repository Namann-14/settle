# bts.jsonc

**Purpose:** Metadata from the Better-T-Stack scaffolder that generated the repo.

**Key contents:** Records stack choices: Next.js frontend, no backend/db/auth in the scaffold, addons fumadocs, mcp, skills, turborepo, npm, Vercel web deploy, plus the reproducible create command.

**Depends on / used by:** Used only by `create-better-t-stack add`; not read at runtime.

**Decisions & caveats:** Actual backend (FastAPI services), Clerk and Postgres were added outside the scaffold, so this file does not describe the real stack. Keep it only if the `add` command is wanted.
