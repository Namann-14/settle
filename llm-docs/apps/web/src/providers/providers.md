# apps/web/src/providers/providers.tsx

**Purpose:** Site-wide client providers for the root layout.

**Key contents:** `Providers` wraps children in Clerk's `ClerkProvider` and the theme provider (`attribute=class`, `defaultTheme=system`, `forcedTheme=light`).

**Depends on / used by:** `providers/theme-provider.tsx`; used by the root layout.

**Decisions & caveats:** Theme is currently forced to light even though `enableSystem` is set, so dark mode is effectively off. Kept minimal on purpose; dashboard-only providers live in `DashboardProviders`.
