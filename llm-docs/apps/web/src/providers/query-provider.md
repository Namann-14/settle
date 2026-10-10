# apps/web/src/providers/query-provider.tsx

**Purpose:** React Query provider for the client.

**Key contents:** `QueryProvider` supplies `getQueryClient()` and mounts the devtools only when `NODE_ENV` is development.

**Depends on / used by:** `lib/queryClient.ts`; used by `DashboardProviders`.

**Decisions & caveats:** Nothing notable.
