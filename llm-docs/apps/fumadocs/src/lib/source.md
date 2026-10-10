# apps/fumadocs/src/lib/source.ts

**Purpose:** Fumadocs content loader and URL helpers.

**Key contents:** Builds `source` with `loader` (base URL `/docs`, Lucide icon plugin) from the generated collections; helpers `getPageImage`, `getPageMarkdownUrl`, and `getLLMText` (title, URL and processed Markdown).

**Depends on / used by:** Imports `collections/server` generated from `source.config.ts`; used by the routes under `src/app`.

**Decisions & caveats:** Depends on the generated `.source` output existing.
