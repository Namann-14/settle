# apps/web/src/app/sitemap.ts

**Purpose:** Generates `/sitemap.xml`.

**Key contents:** Lists `/` and `/privacy`.

**Depends on / used by:** `lib/site.ts` for the origin.

**Decisions & caveats:** Public pages only. Add new public routes (for example `/terms`, use-case pages) here when created. The docs site (`apps/fumadocs`) is a separate deployment with its own sitemap needs.
