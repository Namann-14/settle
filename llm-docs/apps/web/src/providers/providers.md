# apps/web/src/providers/providers.tsx

**Purpose:** Site-wide client providers for the root layout.

**Key contents:** `Providers` wraps children in Clerk's `ClerkProvider` and the theme provider (`attribute=class`, `defaultTheme=system`, `forcedTheme=light`).

**Depends on / used by:** `providers/theme-provider.tsx`; used by the root layout.

**Decisions & caveats:** Light is forced only outside `/dashboard` (`forcedTheme` keyed off the pathname): the landing art and video are made for light, while the signed-in app follows the user's choice from Settings > Appearance (default system). Enabled 2026-11-01. Kept minimal on purpose; dashboard-only providers live in `DashboardProviders`.
