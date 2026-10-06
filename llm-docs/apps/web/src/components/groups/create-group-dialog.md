# apps/web/src/components/groups/create-group-dialog.tsx

**Purpose:** Dialog to create a group and invite members by email in one step.

**Key contents:** `CreateGroupDialog` collects name, description, currency and email chips (split on comma/space, validated, de-duplicated, own email dropped), creates the group, then invites each email and navigates to the new group.

**Depends on / used by:** Uses `forms/field.tsx`, `useCreateGroup`, `inviteMember` from `@/lib/api/groups`, `useCurrentUser`.

**Decisions & caveats:** Invites use `Promise.allSettled` so one bad address does not block others; failures are reported by count after the group exists. Pending text in the email box is included on submit. Defaults currency to the user's default (INR fallback).
