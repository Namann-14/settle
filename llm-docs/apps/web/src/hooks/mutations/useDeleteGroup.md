# apps/web/src/hooks/mutations/useDeleteGroup.ts

**Purpose:** Mutation to delete a group.

**Key contents:** `useDeleteGroup` invalidates `groups`.

**Depends on / used by:** Uses `lib/api/groups`.

**Decisions & caveats:** Only invalidates `groups`; related expense and balance caches are not cleared here.
