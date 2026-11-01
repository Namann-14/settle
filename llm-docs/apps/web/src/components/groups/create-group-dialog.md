# apps/web/src/components/groups/create-group-dialog.tsx

**Purpose:** Dialog to create a group and invite members by email in one step.

**Key contents:** `CreateGroupDialog` collects name, description, currency and email chips (split on comma/space, validated, de-duplicated, own email dropped), creates the group, then invites each email and navigates to the new group.

**Depends on / used by:** Uses `forms/field.tsx`, `buttonClass` from `dashboard/panel.tsx` (Cancel / Create group pills; the title is Inter, not serif), `useCreateGroup`, `inviteMember` from `@/lib/api/groups`, `useCurrentUser`.

**Decisions & caveats:** Invites use `Promise.allSettled` so one bad address does not block others; failures are reported by count ("couldn't be invited") after the group exists. Every invite is pending until accepted, so the success toast counts pending invites. Pending text in the email box is included on submit. Defaults currency to the user's default (INR fallback).
