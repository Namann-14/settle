# apps/web/src/app/page.tsx

**Purpose:** Public landing page.

**Key contents:** Navbar (with `SettleLogo`), hero (badge, headline, CTAs), a static illustrative `DashboardPreview` with sample data, then landing sections (trust strip, features, how it works, AI spotlight, pricing, FAQ, footer).

**Depends on / used by:** Uses `components/landing/*`. Route `/`.

**Decisions & caveats:** Server-rendered on purpose: only `NavAuth`, `DemoVideoButton` and `HeroVideo` are client components, so the rest ships no JS. The hero video is deferred until idle. Preview figures are fake sample data, not real. Update: wrapped in `LandingMotion`; `motion.tsx` helpers are also client components. Hero preview has `Tilt`, `CountUp` stats and a `Typewriter` prompt; nav links have hover pills. Hero CTA is wrapped in `Magnet`; the hero badge text uses `.shiny-text`. Navbar is `ResizableNav` (fixed, shrinks into a pill on scroll, progress outline around its border); hero preview has `ActivityToasts`; `BackToTop` is rendered at the end; only "You're owed" counts up. Hero preview is wrapped in `ScrollFx` (scales, fades and tilts away as you scroll). Root uses `overflow-x-clip` (not `hidden`, which breaks `position: sticky`); everything above the footer is wrapped in a `z-10` layer so the sticky footer is revealed behind it. The page adds `WhatIsSettle` after the trust strip.
