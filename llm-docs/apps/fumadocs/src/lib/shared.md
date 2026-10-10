# apps/fumadocs/src/lib/shared.ts

**Purpose:** Central constants for the docs site.

**Key contents:** `appName`, route prefixes (`/docs`, `/og/docs`, `/llms.mdx/docs`), and `gitConfig`.

**Depends on / used by:** Used by the proxy, source loader, layouts, OG route and docs page.

**Decisions & caveats:** `appName` ("My App") and `gitConfig` (`fuma-nama/fumadocs`) are template defaults that should be updated for Settle.
