# apps/web/src/components/ai-elements/edge.tsx

**Purpose:** Custom React Flow edges (temporary and animated).

**Key contents:** `Edge.Temporary` (dashed) and `Edge.Animated` (with moving marker) computing handle positions.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@xyflow/react`; pairs with `canvas`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
