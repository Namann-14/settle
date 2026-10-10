# apps/web/src/components/mode-toggle.tsx

**Purpose:** Light/dark/system theme dropdown.

**Key contents:** `ModeToggle` client component using `next-themes` `setTheme` and a shadcn-style DropdownMenu with animated sun/moon icons.

**Depends on / used by:** Uses `@settle/ui` Button and DropdownMenu; imported (currently only in commented code) by `header.tsx`.

**Decisions & caveats:** Trigger uses the `render` prop pattern of the UI library's DropdownMenuTrigger rather than `asChild`.
