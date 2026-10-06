# packages/ui/src/components/scroll-area.tsx

**Purpose:** Custom styled scrollable region.

**Key contents:** Exports ScrollArea and ScrollBar around Base UI ScrollArea.

**Depends on / used by:** Uses `cn`.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
