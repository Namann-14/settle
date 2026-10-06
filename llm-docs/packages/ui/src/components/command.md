# packages/ui/src/components/command.tsx

**Purpose:** Command palette / searchable list.

**Key contents:** `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`.

**Depends on / used by:** `cmdk`, `dialog.tsx`, lucide icons.

**Decisions & caveats:** Uses cmdk (not Base UI), so it filters items client-side by text value. Client component.
