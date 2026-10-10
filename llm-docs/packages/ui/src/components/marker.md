# packages/ui/src/components/marker.tsx

**Purpose:** Small inline muted marker/divider row (e.g. date or status separators in a chat).

**Key contents:** `Marker`, `MarkerIcon`, `MarkerContent`, and `markerVariants` (default / separator with side rules / border).

**Depends on / used by:** Uses Base UI `useRender` + `mergeProps`, cva, `cn`. Likely used alongside message and message-scroller.

**Decisions & caveats:** Supports the `render` prop to swap the underlying element (e.g. render as a link). Not a stock shadcn component.
