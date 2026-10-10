# packages/ui/src/components/textarea.tsx

**Purpose:** Styled multi-line input.

**Key contents:** Single `Textarea` with field-sizing and project border/ring styles.

**Depends on / used by:** Used by forms and input-group.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
