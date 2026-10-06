# apps/web/src/html/index.html

**Purpose:** Standalone static HTML prototype of the marketing/landing page (branded 'Nexora'), apparently a design mock from before the real landing page was built in Next.js.

**Key contents:** Single self-contained page: Tailwind via CDN, React 18 + Babel standalone from unpkg, Google Fonts (Instrument Serif, Inter). Inline React components for icons, a navbar and a hero section with a dashboard preview. About 530 lines.

**Depends on / used by:** Not imported by the Next app; shares design tokens (fonts, `fadeUp` animation, `--shadow-dashboard`) with `apps/web/src/index.css`.

**Decisions & caveats:** Not part of the build and uses runtime Babel and CDN scripts, so it is for reference only. The 'Nexora' name is a leftover template name, not the product (Settle). Safe to ignore or delete.
