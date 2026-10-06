# packages/ui/src/components/sonner.tsx

**Purpose:** Toast notifications host.

**Key contents:** `Toaster` wrapping `sonner`, themed via next-themes `useTheme` and custom lucide icons per toast type.

**Depends on / used by:** Depends on sonner, next-themes, lucide-react. Per decisions.md the Toaster is mounted in DashboardProviders, not the root layout.

**Decisions & caveats:** Requires a next-themes provider above it. Mounted only under dashboard routes to keep public pages light.
