# packages/ui/src/components/bubble.tsx

**Purpose:** Chat message bubble primitives.

**Key contents:** `BubbleGroup`, `Bubble` (variants default, secondary, muted, tinted, outline, ghost, destructive; `align` start/end), `BubbleContent`, `BubbleReactions`.

**Depends on / used by:** Used by the AI chat UI.

**Decisions & caveats:** The `tinted` variant uses CSS relative oklch colors derived from `--primary`, which needs a modern browser. Variants style the child `bubble-content` via data-slot selectors.
