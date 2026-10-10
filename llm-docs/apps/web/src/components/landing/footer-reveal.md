# apps/web/src/components/landing/footer-reveal.tsx

**Purpose:** Triggers the footer's entrance animations once the sticky footer is actually being uncovered.

**Key contents:** `useFooterRevealed(distance)` (true once the page is within `distance` px of the bottom, then stays true) and `FooterReveal` (fade/lift wrapper driven by it).

**Depends on / used by:** `motion/react`; used by `footer.tsx` and `footer-wordmark.tsx`.

**Decisions & caveats:** The footer is `sticky bottom-0` behind the page, so it is "in view" from first paint and `whileInView` would fire while still covered. The 420px default must stay below the footer height.
