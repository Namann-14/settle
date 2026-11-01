# apps/web/src/components/settings/appearance-panel.tsx

**Purpose:** Settings "Appearance" panel: Light / Dark / System theme choice.

**Key contents:** `AppearancePanel` uses next-themes `useTheme` with the `Segmented` primitive; renders a same-sized pulse placeholder until mount to avoid a hydration mismatch.

**Depends on / used by:** `next-themes`, `Panel`/`PanelHeader`/`Segmented`. Rendered by the settings page.

**Decisions & caveats:** `providers/providers.tsx` sets `forcedTheme="light"`, so while that lock exists the control is shown disabled on "Light" with a one-line note, instead of a toggle that silently does nothing. Removing `forcedTheme` there enables it with no change here.
