# apps/web/src/components/landing/features.tsx

**Purpose:** Landing page 'trust strip' and features grid.

**Key contents:** Exports `TrustStrip` (audiences list) and the feature section built from small helpers (`Eyebrow`, `FeatureCard`, `Pill`) with static illustrative content.

**Depends on / used by:** Uses `section-heading.tsx`; rendered by the landing page.

**Decisions & caveats:** Server component, static marketing content only. Trust strip is now a pausable CSS marquee (duplicated list, second copy `aria-hidden`); feature cards use `Reveal` + `Spotlight` from `motion.tsx`. Card interiors now come from `feature-demos.tsx` (the old static `Pill` helper is gone); the AI capture card plays bubble, parsed card, counts, then auto-confirm. Cards drift at different speeds on scroll (`ScrollFx`).
