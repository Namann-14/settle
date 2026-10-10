# apps/web/src/components/ai-elements/toolbar.tsx

**Purpose:** Node toolbar wrapper for React Flow canvas nodes.

**Key contents:** A single `Toolbar` component wrapping `NodeToolbar` from `@xyflow/react` with positioning defaults.

**Depends on / used by:** Depends on `@xyflow/react`; pairs with node.tsx/canvas.tsx/edge.tsx in this folder.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library.
