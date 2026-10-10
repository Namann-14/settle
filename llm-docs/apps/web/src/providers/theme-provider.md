# apps/web/src/providers/theme-provider.tsx

**Purpose:** Thin client wrapper around `next-themes`.

**Key contents:** `ThemeProvider` forwards props to `NextThemesProvider`.

**Depends on / used by:** `providers/providers.tsx`.

**Decisions & caveats:** Wrapper exists because next-themes needs to be rendered from a client component.
