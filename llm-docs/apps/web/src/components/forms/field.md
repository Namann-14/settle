# apps/web/src/components/forms/field.tsx

**Purpose:** Shared form primitives for dialogs and sheets.

**Key contents:** Exports `controlClass` (input styling), `Field` (label, hint, child), `FormError`, and the `CURRENCIES` list.

**Depends on / used by:** Used by `expenses/expense-sheet.tsx`, `groups/create-group-dialog.tsx`, `groups/group-detail.tsx` and settlement forms.

**Decisions & caveats:** Plain native controls sized larger than shadcn defaults to match the design. `CURRENCIES` is a hard-coded short list, and no exchange rates exist, so totals never convert (see decisions.md).
