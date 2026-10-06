# apps/web/src/components/ai-elements/agent.tsx

**Purpose:** Card-style display of an AI agent: header, instructions, tools and output schema.

**Key contents:** Composable `Agent`, `AgentHeader`, `AgentContent`, `AgentInstructions`, `AgentTools`/`AgentTool` (accordion), `AgentOutput`.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` Badge/Accordion and the `Tool` type from `ai`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
