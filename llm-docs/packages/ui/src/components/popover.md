# packages/ui/src/components/popover.tsx

**Purpose:** Click-triggered floating panel.

**Key contents:** Exports Popover, PopoverTrigger, PopoverContent (positioner/popup), plus header/title/description helpers.

**Depends on / used by:** Base UI popover; uses `cn`.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
