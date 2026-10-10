# apps/fumadocs/package.json

**Purpose:** Package manifest for the docs workspace.

**Key contents:** Scripts: `dev` on port 4000, `build`, `start`, `types:check`; `postinstall` runs `fumadocs-mdx`. Deps: fumadocs-core/mdx/ui, Next 16, React 19, Tailwind 4, `cnfast`.

**Depends on / used by:** Part of the npm workspaces monorepo; the web app uses port 3001 and the docs app 4000 so they do not clash.

**Decisions & caveats:** `fumadocs-ui` is aliased to `@fumadocs/base-ui`. Fumadocs versions are pinned exactly, while most others use carets.
