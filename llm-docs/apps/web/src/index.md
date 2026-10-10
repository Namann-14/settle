# apps/web/src/index.css

**Purpose:** Global stylesheet for the web app, layered on the shared UI package styles.

**Key contents:** Imports `@settle/ui/globals.css`; defines a Tailwind `@theme inline` block (display/body font vars, `--shadow-dashboard`), hides the page scrollbar while keeping scroll, smooth scrolling, a `fadeUp` keyframe with an `.animate-fade-up` utility driven by `--y/--duration/--delay` CSS vars, and `.font-display` / `.font-body` classes.

**Depends on / used by:** `packages/ui/src/styles/globals.css`; imported by the root layout. Font vars (`--font-instrument-serif`, `--font-inter`) come from `next/font` in the layout.

**Decisions & caveats:** Scrollbar is hidden site-wide, which hurts discoverability on long pages. `.animate-fade-up` starts at opacity 0 and relies on `forwards` fill, so elements stay invisible if the animation is disabled. Inter's unused optical-size axis was dropped for size (decisions.md). Also defines micro-interaction keyframes/utilities: `animate-caret`, `animate-marquee`, `animate-drift`, `.btn-shine`, `.faq-item` details animation, all disabled under `prefers-reduced-motion`. Adds `.shiny-text` (sweeping light across text). Adds `.lift` (hover lift, used by dashboard `Panel` and stat cards). `.btn-shine`, `.lift` and marquee pause hover effects are wrapped in `@media (hover: hover)` so they do not stick after a tap on touch screens.
