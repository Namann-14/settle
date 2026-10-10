# packages/ui/src/components/skeleton.tsx

**Purpose:** Loading placeholder block.

**Key contents:** Single `Skeleton` with pulse animation and muted background.

**Depends on / used by:** Used for loading states and in sidebar.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
