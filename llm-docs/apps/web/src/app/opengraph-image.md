# apps/web/src/app/opengraph-image.tsx

**Purpose:** Generated 1200x630 social share image for the site.

**Key contents:** `next/og` `ImageResponse` with brand name, tagline and subline on the dark green background; exports `alt`, `size`, `contentType`.

**Depends on / used by:** Picked up automatically by Next for `og:image`; Twitter falls back to it.

**Decisions & caveats:** Colours are hex approximations of the theme's oklch tokens because Satori does not parse oklch. Uses the default font, not Instrument Serif.
