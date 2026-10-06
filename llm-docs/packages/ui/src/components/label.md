# packages/ui/src/components/label.tsx

**Purpose:** Styled form label.

**Key contents:** Single `Label` wrapping a native `<label>` with disabled/peer styling.

**Depends on / used by:** Uses `cn`; pairs with input/switch/select in forms.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
