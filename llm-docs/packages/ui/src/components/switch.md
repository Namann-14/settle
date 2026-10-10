# packages/ui/src/components/switch.tsx

**Purpose:** Toggle switch.

**Key contents:** Single `Switch` (sizes) wrapping Base UI Switch root and thumb.

**Depends on / used by:** Used in forms/settings.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
