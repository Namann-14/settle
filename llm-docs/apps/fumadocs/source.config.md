# apps/fumadocs/source.config.ts

**Purpose:** Fumadocs MDX collection definition.

**Key contents:** `defineDocs` over `content/docs` with the default page and meta schemas, and `includeProcessedMarkdown` enabled; empty `mdxOptions`.

**Depends on / used by:** Feeds `.source` generated output, imported as `collections/server` in `src/lib/source.ts`.

**Decisions & caveats:** `includeProcessedMarkdown` is required for `getLLMText` (llms.txt and Markdown routes) to work.
