# apps/web/src/providers/dashboard-providers.tsx

**Purpose:** Client providers needed only by dashboard pages.

**Key contents:** `DashboardProviders` wraps children in `QueryProvider`, tooltip provider and the sonner `Toaster`.

**Depends on / used by:** `providers/query-provider.tsx`, `@settle/ui` tooltip/sonner; used by the dashboard layout.

**Decisions & caveats:** Moved out of the root layout so public pages (landing) do not download React Query, tooltips or toasts (decisions.md).
