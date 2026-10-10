# apps/web/src/components/settle-logo.tsx

**Purpose:** The Settle logo as React components.

**Key contents:** `SettleMark`, the split-coin mark as inline SVG, and `SettleLogo`, the mark plus the "Settle" wordmark in `font-display` (Instrument Serif).

**Depends on / used by:** `cn` from `@settle/ui`. Used by the landing navbar (`app/page.tsx`), `landing/footer.tsx` and `dashboard/app-sidebar.tsx`.

**Decisions & caveats:** Server-safe (no hooks), so the landing page stays server-rendered. Uses `fill-primary` and `fill-primary/45` rather than the fixed colors in `public/brand/settle-mark.svg`, so it follows light and dark mode. Keep the path data in sync with the SVG files if the mark changes.
