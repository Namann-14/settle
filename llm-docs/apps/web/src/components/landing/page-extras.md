# apps/web/src/components/landing/page-extras.tsx

**Purpose:** Page-level landing interactions that are not card or section decoration.

**Key contents:** `BackToTop` (button with scroll-progress ring), `ActivityToasts` (cycling live-activity toast over the hero preview, large screens only), `TypingDots` (dots before the AI reply), `DebtCollapse` (IOUs struck out one by one, then the single payment lands; Replay button).

**Depends on / used by:** `motion/react` (inside `LandingMotion`), `lucide-react`; used by `app/page.tsx`, `how-it-works.tsx`, `ai-spotlight.tsx`.

**Decisions & caveats:** The navbar is fixed (see `resizable-nav.tsx`), so anchored sections use `scroll-mt-20`. Toast text is sample data. All timers respect reduced motion where they loop.
