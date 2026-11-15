# apps/web/src/app/robots.ts

**Purpose:** Generates `/robots.txt`.

**Key contents:** Allows `/`, disallows `/dashboard` and `/api/`, points to `/sitemap.xml`.

**Depends on / used by:** `lib/site.ts` for the origin.

**Decisions & caveats:** Disallow stops crawling but not indexing of known URLs; the dashboard layout also sets `noindex` metadata. Because Clerk redirects unauthenticated requests, crawlers never see dashboard content anyway.
