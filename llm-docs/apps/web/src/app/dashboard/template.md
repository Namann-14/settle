# apps/web/src/app/dashboard/template.tsx

**Purpose:** Gives every dashboard route the same short entrance animation.

**Key contents:** Wraps children in a `div.animate-page-in` (fade plus 6px rise, 280ms).

**Depends on / used by:** `.animate-page-in` in `src/index.css`. Next renders it inside `app/dashboard/layout.tsx` for every child route.

**Decisions & caveats:** A template remounts on each navigation (a layout would not), which is what replays the entrance. It is the only page-level animation in the app (DESIGN.md "Motion"); pages do not stagger their own content. Disabled under `prefers-reduced-motion`.
