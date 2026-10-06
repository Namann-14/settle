# apps/fumadocs/tsconfig.json

**Purpose:** TypeScript config for the docs app.

**Key contents:** Strict, bundler resolution, `@/*` mapping to `src/*`, and `collections/*` mapping to the generated `.source/*`; Next plugin enabled.

**Depends on / used by:** Used by `types:check` (`fumadocs-mdx && next typegen && tsc --noEmit`).

**Decisions & caveats:** `collections/*` only resolves after `fumadocs-mdx` has generated `.source`, so run `npm install` or that command first.
