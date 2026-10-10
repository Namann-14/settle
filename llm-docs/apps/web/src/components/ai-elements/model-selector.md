# apps/web/src/components/ai-elements/model-selector.tsx

**Purpose:** Command-palette dialog for choosing an LLM, with provider logos.

**Key contents:** `ModelSelector` dialog parts: trigger, content, input, list, group, item, shortcut, separator, `ModelSelectorLogo`/`LogoGroup`, name.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` Dialog/Command; logos load from models.dev.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Logo images are fetched from an external host at runtime.
