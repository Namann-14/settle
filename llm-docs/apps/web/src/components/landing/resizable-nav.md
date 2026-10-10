# apps/web/src/components/landing/resizable-nav.tsx

**Purpose:** The landing page navbar: full width at the top, then shrinks into a floating frosted rectangular bar (`rounded-xl`, not a pill) after scrolling (adapted from Aceternity UI's Resizable Navbar).

**Key contents:** `ResizableNav` (fixed header, spring width/padding animation, 72px spacer, mobile hamburger menu, and a scroll-progress outline) and an internal `NavLinks` with a highlight that slides to the hovered link.

**Depends on / used by:** `motion/react` `m` components (inside `LandingMotion`), `lucide-react`; used by `app/page.tsx`, which passes the logo and `NavAuth` as props/children.

**Decisions & caveats:** Written by hand rather than keeping the registry file (`npx shadcn add @aceternity/resizable-navbar-demo`): that one needs `@tabler/icons-react`, imports the full `motion` build (throws under `LazyMotion strict`) and uses `layoutId` (needs layout features). The shrink width is `62%` on desktop with a `760px` minimum; mobile stays full width. `NavAuth` renders twice (desktop actions, mobile menu) but the mobile copy only mounts when the menu is open. Hover pill position is measured from `offsetLeft/offsetWidth`. Progress is an SVG `rect` (`pathLength` driven by scroll) laid over the navbar border: it starts top-left, runs clockwise and closes the loop at the bottom of the page. Its `rx` (12) must match the bar's `rounded-xl`. Mobile: 44px hamburger, opaque full-width menu with 48px rows and full-width auth buttons, a scrim (rendered outside the transformed bar, since `fixed` inside a transformed element is relative to it), Escape and tap-outside close, page scroll locked while open, auto-close when switching to desktop.
