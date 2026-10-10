# apps/web/src/components/ai-elements/chain-of-thought.tsx

**Purpose:** Collapsible display of an agent's reasoning steps, search results and images.

**Key contents:** `ChainOfThought` (controllable open state), header, step (with status), search results/result badges, content, image.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Imported by the chat UI (`components/chat/`). Uses `@settle/ui` Badge/Collapsible.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
