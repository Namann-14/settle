# apps/web/src/app/page.tsx

**Purpose:** Public landing page.

**Key contents:** Navbar (with `SettleLogo`), hero (badge, headline, CTAs), a static illustrative `DashboardPreview` with sample data, then landing sections (trust strip, features, how it works, AI spotlight, pricing, FAQ, footer).

**Depends on / used by:** Uses `components/landing/*`. Route `/`.

**Decisions & caveats:** Server-rendered on purpose: only `NavAuth`, `DemoVideoButton` and `HeroVideo` are client components, so the rest ships no JS. The hero video is deferred until idle. Preview figures are fake sample data, not real.
