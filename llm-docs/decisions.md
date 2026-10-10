# decisions.md

**Purpose:** Running log of product and architecture decisions for Settle with reasoning.

**Key contents:** Entries: personal expense tracker (spending is the user's share, default currency only, standing budgets, idempotent recurring sync with no cron, 12 seeded system categories, minimal incomes); dashboard performance without Redis (move Vercel region to sin1, fewer queries, pool tuning, request timing logs); faster first load (server prefetch, lighter landing page, deferred hero video); split-coin logo and where its icon files live.

**Depends on / used by:** Referenced by most docs here; code in `services/api`, `services/ai` and `apps/web`.

**Decisions & caveats:** Append new decisions with a date heading. Includes an irreversible migration (`5b1e0c7d9a21`, category merge) and a note to check the production `DATABASE_URL` points at the Singapore Neon DB.

## 2026-10-11 Landing page micro-interactions

- Added a small `motion`-based kit (`landing/motion.tsx`) inspired by Aceternity UI: scroll reveals, cursor spotlight cards, hero tilt, count-up, typewriter prompt, marquee, button sheen, scroll-progress bar.
- Kept it light: `LazyMotion` + `domAnimation` with `strict`, pointer effects via CSS variables, everything respects `prefers-reduced-motion`.
- Restraint: one signature moment (hero types an expense, stats count up); ambient motion limited to the marquee and the final CTA glow. Dashboard untouched.
- Feature cards got live demos (`feature-demos.tsx`), and a few React Bits ideas (magnet CTA, click spark, shiny text) were added alongside the Aceternity-style effects.
- Count-up is used once (hero "You're owed"); other numbers use different effects (pop, sheen, strike-through) so nothing repeats.
- Page-wide additions: fixed frosted nav that hides on scroll down, back-to-top with progress ring, hero activity toast, typing dots in the AI demo, animated before/after debt collapse, and light hover lifts in the dashboard.
- Footer redesigned: brand + CTA, three link columns, and a giant cropped `settle` wordmark that lights up under the cursor.
- Navbar is now resizable (Aceternity-style): full width at the top, floating frosted pill after scroll. The scroll-progress bar moved from the top of the page to the top edge of the navbar, and the old hide-on-scroll-down behaviour was dropped. `@aceternity` was added to `apps/web/components.json` registries.
- Added scroll-linked animations (`scroll-effects.tsx`) next to the one-shot reveals: hero preview recedes, feature cards parallax, trace line through the steps, AI panel scales in, Pro card floats, final headline fills word by word.
- Footer is a sticky reveal (page slides away to uncover it). Needs `overflow-x-clip` on the page root, since `overflow-x-hidden` breaks sticky. Footer animations key off scroll distance to the bottom, not in-view.
- Took one idea from the Lilac Meadow reference ("What is ...?" three-card section) and rebuilt it with Settle's own art and copy. A layered hero parallax (coins, chip, pollen, video drift) was tried and removed at the owner's request.
