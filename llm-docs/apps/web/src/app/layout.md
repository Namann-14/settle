# apps/web/src/app/layout.tsx

**Purpose:** Root Next.js layout: fonts, global CSS, metadata and site-wide providers.

**Key contents:** Loads Instrument Serif and Inter via `next/font/google`, sets metadata (`metadataBase`, title/description, Open Graph, Twitter `summary_large_image`), wraps body in `Providers`.

**Depends on / used by:** Uses `../index.css`, `providers/providers` and `lib/site.ts`. Parent of every route. Social image comes from `opengraph-image.tsx`.

**Decisions & caveats:** Inter is loaded without extra axes because the optical-size axis was unused and inflated the font by about half (decisions.md). Only Clerk and theme providers are site-wide; dashboard-only providers were moved out to keep public pages light. Text selection uses the theme's `primary` / `primary-foreground` (it was a stray indigo `#6366f1`, the only off-palette hue; see `DESIGN.md`).
