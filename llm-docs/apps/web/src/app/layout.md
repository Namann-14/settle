# apps/web/src/app/layout.tsx

**Purpose:** Root Next.js layout: fonts, global CSS, metadata and site-wide providers.

**Key contents:** Loads Instrument Serif and Inter via `next/font/google`, sets site title/description, wraps body in `Providers`.

**Depends on / used by:** Uses `../index.css` and `providers/providers`. Parent of every route.

**Decisions & caveats:** Inter is loaded without extra axes because the optical-size axis was unused and inflated the font by about half (decisions.md). Only Clerk and theme providers are site-wide; dashboard-only providers were moved out to keep public pages light.
