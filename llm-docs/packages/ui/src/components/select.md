# packages/ui/src/components/select.tsx

**Purpose:** Dropdown select.

**Key contents:** Exports Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator, scroll buttons; uses Chevron/Check icons.

**Depends on / used by:** Base UI Select, lucide-react, `cn`. Used in forms (currency, category, etc.).

**Decisions & caveats:** Base UI Select differs from Radix in value/label handling (items are rendered through the positioner), so migrating snippets from shadcn docs may need tweaks.
