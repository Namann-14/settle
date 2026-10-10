# apps/fumadocs/src/app/og/docs/[...slug]/route.tsx

**Purpose:** Generates Open Graph images for docs pages.

**Key contents:** Renders Fumadocs' default OG image (title, description, site name) at 1200x630 using `ImageResponse`.

**Depends on / used by:** Uses `appName` from `src/lib/shared.ts`; URLs come from `getPageImage` in `src/lib/source.ts`.

**Decisions & caveats:** `appName` is still "My App". Statically generated per page.
