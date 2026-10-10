# packages/ui/src/components/separator.tsx

**Purpose:** Horizontal/vertical divider.

**Key contents:** Single `Separator` wrapping Base UI Separator.

**Depends on / used by:** Used by sidebar and layouts.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
