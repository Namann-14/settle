# apps/web/src/components/landing/bento-demos.tsx

**Purpose:** Interactive mini demos that live inside `BentoCard`s.

**Key contents:** How it works: `InviteDemo` (members join one by one, button invites more), `AddMethodsDemo` (Chat / Receipt / Form tabs), `SettleUpDemo` (mark payments paid, "All settled"). Split it your way: `SplitModesDemo` (Equal / Shares / Percent / Exact; bars re-flow, totals always sum to ₹2,400), `BudgetDemo` (bar goes calm, amber, red and shakes when over), `SyncDemo` (add an expense and member avatars ping). Internal `Segmented` control and `useStart` (in-view start).

**Depends on / used by:** `motion/react`, `lucide-react`; used by `how-it-works.tsx` and `split-your-way.tsx`.

**Decisions & caveats:** Autoplay starts on scroll-in and stops once someone interacts (`manual`), so clicks are never fought. Reduced motion skips loops and shows the finished state. No count-up here on purpose (`CountUp` is hero-only). Amounts and names are sample data. Uses `m` only, no `layoutId`.
