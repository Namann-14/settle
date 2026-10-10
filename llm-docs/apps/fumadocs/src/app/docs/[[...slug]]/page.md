# apps/fumadocs/src/app/docs/[[...slug]]/page.tsx

**Purpose:** Renders a single docs page.

**Key contents:** Looks up the page via `source.getPage`, renders title, description, TOC, a copy-Markdown button and a view-options popover, then the MDX body. Provides `generateStaticParams` and `generateMetadata` (with OG image).

**Depends on / used by:** Uses `src/lib/source.ts`, `src/lib/shared.ts`, `src/components/mdx.tsx`.

**Decisions & caveats:** The GitHub link is built from `gitConfig` in `shared.ts`, which still points at the template repo (`fuma-nama/fumadocs`), and uses `content/docs/` as the path.
