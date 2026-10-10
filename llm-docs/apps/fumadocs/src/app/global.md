# apps/fumadocs/src/app/global.css

**Purpose:** Global styles for the docs site.

**Key contents:** Imports Tailwind, Fumadocs neutral theme and preset; forces a stable scrollbar gutter and neutralizes the scroll-lock margin shift.

**Depends on / used by:** Imported by `src/app/layout.tsx`.

**Decisions & caveats:** The `[data-scroll-locked]` override prevents layout jump when dialogs open.
