# apps/web/src/components/landing/pricing.tsx

**Purpose:** Landing pricing section with Free and Pro tiers.

**Key contents:** Static feature lists, a `FeatureList` helper and two plan cards priced in INR, with `GetStartedButton` CTAs.

**Depends on / used by:** Uses `get-started-button.tsx` and `section-heading.tsx`.

**Decisions & caveats:** Marketing copy only; no billing logic exists here. Feature claims (e.g. Pro tier items) are not enforced in code by this file. Plan cards use `Reveal` + `Spotlight`; primary button uses `.btn-shine`.
