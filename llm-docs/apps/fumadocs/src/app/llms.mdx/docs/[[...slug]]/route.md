# apps/fumadocs/src/app/llms.mdx/docs/[[...slug]]/route.ts

**Purpose:** Serves the Markdown of one docs page.

**Key contents:** `GET` returns `getLLMText(page)` as `text/markdown`; slug's last segment (`content.md`) is stripped before lookup.

**Depends on / used by:** Target of the rewrites in `apps/fumadocs/proxy.ts` and `getPageMarkdownUrl` in `src/lib/source.ts`.

**Decisions & caveats:** Static params generated for every page. Statically generated.
