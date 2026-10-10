# apps/web/src/app/dashboard/layout.tsx

**Purpose:** Shell layout for all dashboard pages: providers, sidebar, topbar, and shared prefetch.

**Key contents:** Wraps children in `DashboardProviders` and a `Prefetch` of current user, groups and categories, then `SidebarProvider` with `RecurringSync`, `AppSidebar`, `Topbar` and a padded content area.

**Depends on / used by:** Uses `@settle/ui` sidebar, `providers/dashboard-providers`, `apps/web/src/lib/server-prefetch.tsx`. Parent of every dashboard page.

**Decisions & caveats:** Dashboard-only providers (React Query, tooltips, toasts) live here rather than the root layout so public pages ship less JS. `RecurringSync` triggers the once-per-session recurring-expense sync (see decisions.md, recurring expenses). User/groups/categories are prefetched here because nearly every page and dialog needs them.
