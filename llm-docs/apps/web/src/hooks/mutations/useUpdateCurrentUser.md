# apps/web/src/hooks/mutations/useUpdateCurrentUser.ts

**Purpose:** Mutation for editing the current user's profile (today: default currency).

**Key contents:** `useUpdateCurrentUser` wraps `updateCurrentUser` (PATCH `/api/users/me`); on success writes the returned user into `["currentUser"]`, invalidates it, and calls `invalidateSpending`.

**Depends on / used by:** `lib/api/users`, `./invalidate`; used by `components/settings/account-panel.tsx`. Exported from the mutations barrel.

**Decisions & caveats:** Spending totals are reported in the default currency, so the spending summary is refreshed along with the profile.
