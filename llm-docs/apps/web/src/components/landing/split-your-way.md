# apps/web/src/components/landing/split-your-way.tsx

**Purpose:** "Split it your way" section: budget, group-sync and split-mode cards.

**Key contents:** `SplitYourWay` (anchor `#split`): centred `SectionHeading` over three `BentoCard`s (two dark, one wide light) with demos from `bento-demos.tsx`.

**Depends on / used by:** `bento.tsx`, `bento-demos.tsx`, `section-heading.tsx`; rendered by `app/page.tsx` after How it works.

**Decisions & caveats:** Copy only claims real behaviour (budgets, shared group ledger, the four split modes from the FAQ); it avoids saying "real time".
