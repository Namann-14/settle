# packages/ui/src/components/spinner.tsx

**Purpose:** Animated loading icon.

**Key contents:** `Spinner` = lucide Loader2Icon with spin animation, role=status and aria-label.

**Depends on / used by:** Used inside buttons/loading states.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
