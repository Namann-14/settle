# apps/fumadocs/src/app/layout.tsx

**Purpose:** Root layout of the docs app.

**Key contents:** Sets up Inter font, `RootProvider` from Fumadocs, and a flex column body.

**Depends on / used by:** Imports `global.css`.

**Decisions & caveats:** `suppressHydrationWarning` is set on `<html>` for theme handling.
