# apps/web/src/components/ai-elements/canvas.tsx

**Purpose:** React Flow canvas wrapper for workflow diagrams.

**Key contents:** `Canvas` rendering `ReactFlow` with a background and pan/select defaults.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@xyflow/react`; pairs with `node`, `edge`, `connection`, `controls`, `panel`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Server-safe (no `use client`) wrapper; the React Flow dependency is heavy if ever used.
