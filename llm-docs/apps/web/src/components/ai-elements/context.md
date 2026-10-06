# apps/web/src/components/ai-elements/context.tsx

**Purpose:** Token and cost usage hover card for a model context window.

**Key contents:** `Context` with trigger (percent ring), content header/body/footer, and input/output/reasoning/cache usage rows; computes cost with `getUsage` from `tokenlens`.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `tokenlens`, `@settle/ui` HoverCard/Progress and `LanguageModelUsage` from `ai`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
