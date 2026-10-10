# packages/ui/src/components/dropdown-menu.tsx

**Purpose:** Dropdown menu on Base UI Menu.

**Key contents:** `DropdownMenu`, `Trigger`, `Content`, `Group`, `Label`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Separator`, `Shortcut`, `Sub`, `SubTrigger`, `SubContent`, `Portal`.

**Depends on / used by:** `@base-ui/react/menu`.

**Decisions & caveats:** Base UI's Menu is used instead of Radix, so the trigger composes via `render` rather than `asChild`.
