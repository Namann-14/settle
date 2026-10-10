# apps/web/src/components/landing/scroll-effects.tsx

**Purpose:** Scroll-linked (scrubbed) effects for the landing page where nothing changes position or size: only a line and text colour follow the scroll.

**Key contents:** `TraceLine` (line that draws itself and lights a dot per step, desktop only) and `ScrollWords` (headline that fills in word by word).

**Depends on / used by:** `motion/react` (`useScroll`, `useTransform`, `useSpring`). Used by `how-it-works.tsx` (trace line above the steps) and `footer.tsx` (final CTA headline).

**Decisions & caveats:** A generic `ScrollFx` (parallax / scale / tilt of whole components) existed and was removed on purpose: cards, the hero preview, the AI panel and the Pro plan moving while scrolling felt jittery. Do not reintroduce scroll-driven movement of content blocks. Reduced motion shows the finished line and fully visible words. `TraceLine` shows from `lg` (was `md`), matching the steps grid.
