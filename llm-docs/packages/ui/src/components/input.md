# packages/ui/src/components/input.tsx

**Purpose:** Styled text input.

**Key contents:** Single `Input` wrapping Base UI's Input primitive with project border/ring/size styles.

**Depends on / used by:** Uses `cn`; used by forms, sidebar, input-group.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
