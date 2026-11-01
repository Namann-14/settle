# apps/web/src/components/forms/field.tsx

**Purpose:** Shared form primitives for dialogs and sheets.

**Key contents:** Exports `controlClass` (input/select styling), `Field` (label, hint, child), `FormError`, and the `CURRENCIES` list. The API is stable; groups, spending, expenses and settlements forms import it.

**Depends on / used by:** Used by `expenses/expense-sheet.tsx`, `settlements/record-settlement-dialog.tsx`, `groups/create-group-dialog.tsx`, `groups/group-detail.tsx` and the spending dialogs/pages.

**Decisions & caveats:** `controlClass` follows DESIGN.md inputs (8px corners, `border-input` hairline, transparent fill with the dark-mode input tint, Banknote Green focus border plus a 1px ring at 50%, Oxblood `aria-invalid`), but at 14px text and 40px tall (36px from `sm`) instead of shadcn's 32px/12px, for phone tap targets. `CURRENCIES` is a hard-coded short list, and no exchange rates exist, so totals never convert (see decisions.md).
