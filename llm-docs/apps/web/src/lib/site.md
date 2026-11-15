# apps/web/src/lib/site.ts

**Purpose:** Single source for the public site origin and default SEO strings.

**Key contents:** `SITE_URL`, `SITE_NAME`, `SITE_TITLE`, `SITE_DESCRIPTION`.

**Depends on / used by:** Reads `process.env` directly (no validation, like the other web env vars). Used by `app/layout.tsx` (`metadataBase`, OG, Twitter), `app/robots.ts` and `app/sitemap.ts`.

**Decisions & caveats:** `NEXT_PUBLIC_SITE_URL` wins; otherwise `VERCEL_PROJECT_PRODUCTION_URL` (https) is used; otherwise `http://localhost:3001`. Set `NEXT_PUBLIC_SITE_URL` to the real domain on Vercel, or preview deployments canonicalize to their own host.
