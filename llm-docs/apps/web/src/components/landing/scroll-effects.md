# apps/web/src/components/landing/scroll-effects.tsx

**Purpose:** Scroll-linked (scrubbed) animations for the landing page: values follow scroll position both ways, unlike `Reveal`, which plays once.

**Key contents:** `ScrollFx` (parallax / scale / opacity / rotateX from scroll progress through a target), `TraceLine` (line that draws itself and lights a dot per step), `ScrollWords` (headline that fills in word by word).

**Depends on / used by:** `motion/react` (`useScroll`, `useTransform`, `useSpring`). Used by `app/page.tsx` (hero preview scales, fades and tilts away), `features.tsx` (card parallax at different speeds), `how-it-works.tsx` (trace line above the steps), `ai-spotlight.tsx` (panel scales up as it enters), `pricing.tsx` (Pro card floats up), `footer.tsx` (final CTA headline).

**Decisions & caveats:** Progress goes through a spring for smoothness. Reduced motion renders a plain wrapper, a finished trace line and fully visible words. Keep `ScrollFx` on a wrapper separate from elements that already animate transforms (`Tilt`, `Reveal`) to avoid conflicts. `TraceLine` is hidden below `md`, where steps stack.
