# apps/web/src/components/settings/account-panel.tsx

**Purpose:** Settings "Account" panel: name, email and default currency.

**Key contents:** `AccountPanel` shows name and email read-only from Clerk `useUser` (falling back to the api's current user), a "Manage account" button that opens Clerk's `openUserProfile`, and a native `<select>` for the default currency (INR, USD, EUR, GBP, AED, SGD) saved through `useUpdateCurrentUser`, with a 12px hint that it drives personal spending totals.

**Depends on / used by:** Clerk `useUser`/`useClerk`, `useCurrentUser`, `useUpdateCurrentUser` (hooks/mutations), `Panel`/`PanelHeader`/`rowClass`/`buttonClass`. Rendered by `app/dashboard/settings/page.tsx`.

**Decisions & caveats:** Saves on change (no separate Save button) with a toast. A currency already on the account but outside the short list is kept as an extra option so it never vanishes. The select is 44px with 16px text on phones (tap target, no iOS zoom) and 32px / 12px from sm, per DESIGN.md inputs. Name and email are edited in Clerk, not here, since Clerk is the source of truth for identity.
