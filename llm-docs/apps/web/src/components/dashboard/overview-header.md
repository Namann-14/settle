# apps/web/src/components/dashboard/overview-header.tsx

**Purpose:** Overview page heading with date eyebrow, greeting and an Ask Settle AI link.

**Key contents:** `OverviewHeader` shows today's date and a greeting with the name in italics (parsed from the `useGreeting` string).

**Depends on / used by:** Uses `useGreeting` from `home-composer.tsx`, `panel.tsx`.

**Decisions & caveats:** Date and greeting are client-only, with skeletons first, to avoid hydration mismatch. The name split relies on the greeting format 'Hello, Name' produced by `useGreeting`.
