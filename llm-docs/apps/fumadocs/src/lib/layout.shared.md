# apps/fumadocs/src/lib/layout.shared.tsx

**Purpose:** Shared layout options for home and docs layouts.

**Key contents:** `baseOptions()` returns nav title (`appName`) and the GitHub URL.

**Depends on / used by:** Uses `src/lib/shared.ts`; used by both layouts.

**Decisions & caveats:** GitHub URL derives from the template `gitConfig` values.
