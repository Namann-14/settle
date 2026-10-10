# apps/web/src/components/landing/motion.tsx

**Purpose:** Client-side micro-interaction kit for the landing page, in the style of Aceternity UI, built on `motion`.

**Key contents:** `LandingMotion` (MotionConfig `reducedMotion="user"` + `LazyMotion` with `domAnimation`,), `Reveal` (fade/lift/unblur once in view), `GrowBar`, `Spotlight` (cursor-following glow and border via CSS vars), `Tilt` (subtle pointer 3D tilt), `CountUp`, `Typewriter` (cycles phrases, writes to the DOM directly).

**Depends on / used by:** `motion/react`, `cn`; keyframes and `.btn-shine` / `.faq-item` styles live in `src/index.css`. Used by `app/page.tsx` and the other landing components.

**Decisions & caveats:** Uses the `m` component with `LazyMotion strict` to keep the bundle small, so never import `motion.*` here. `Reveal` starts at opacity 0 in server HTML, so content is hidden until JS hydrates. `CountUp` and `Typewriter` ship the final text in server HTML and skip animation under reduced motion. Pointer tracking never re-renders React. Also exports `Magnet` (pulls hero/final CTA toward the cursor); `CountUp` takes `decimals`. `CountUp` is intentionally used in one place only (hero "You're owed") so the effect stays special. `Reveal` animates opacity and transform only (no blur filter): filter animation repaints the whole block each frame.
