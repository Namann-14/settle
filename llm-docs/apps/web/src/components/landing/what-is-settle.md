# apps/web/src/components/landing/what-is-settle.tsx

**Purpose:** "What is Settle?" overview section: big title and one-line definition, then three cards (one light, two dark) with micro-interactions. Layout follows the "What is Rose Dollar?" reference, with Settle's own copy and art.

**Key contents:** `WhatIsSettle` (anchor `#what`); cards use `Reveal` and `Spotlight`; illustrations come from `what-is-demos.tsx`.

**Depends on / used by:** `get-started-button.tsx`, `motion.tsx`, `what-is-demos.tsx`; rendered by `app/page.tsx` right after the trust strip.

**Decisions & caveats:** Copy only claims what the product does. Server component; the interactive parts are the client demos. Card titles use `font-display` at 34px like the feature cards; body copy is Inter 15px. Cards are 400px tall on phones, 320px from `md`.
