# apps/web/src/components/landing/footer-wordmark.tsx

**Purpose:** Oversized, cropped "settle" wordmark at the very bottom of the landing footer.

**Key contents:** `FooterWordmark`: letters rise in with a stagger once in view; hovering lights the letters under the cursor in the primary colour via a CSS-variable radial mask (no re-renders).

**Depends on / used by:** `motion/react` (inside `LandingMotion`); used by `footer.tsx`.

**Decisions & caveats:** The in-view trigger sits on the clipped wrapper, not the letters: letters start translated outside the `overflow-hidden` box, so observing them directly never fires. Font size is `clamp(6rem, 40vw, 28rem)` with wide tracking because Instrument Serif is condensed; the wrapper height (`0.6em`) crops the bottom on purpose. Decorative, `aria-hidden`. Letters now animate via `useFooterRevealed` instead of `whileInView` (the sticky footer is in view from first paint).
