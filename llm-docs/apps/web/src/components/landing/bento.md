# apps/web/src/components/landing/bento.tsx

**Purpose:** Shared card for the landing page's "demo" cards, modelled on the "What is Settle?" cards: display-serif title top-left, a small interactive demo in the middle, one line of copy at the bottom.

**Key contents:** `BentoCard` (`tone`: `light` gradient, `card` white or `dark`; optional `eyebrow`, `delay`, `className`). Wraps `Reveal` and `Spotlight`; minimum height 360px.

**Depends on / used by:** `motion.tsx`; used by `how-it-works.tsx` and `split-your-way.tsx`.

**Decisions & caveats:** Alternate tones within a row so it does not read as one block. Dark cards expect demos that use `primary-foreground` colours. `what-is-settle.tsx` predates this and keeps its own absolute-positioned illustrations.
