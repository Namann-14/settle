# apps/web/src/components/ai-elements/image.tsx

**Purpose:** Renders an AI-generated image from base64 data.

**Key contents:** `Image` taking an `Experimental_GeneratedImage` and rendering an `<img>` data URI.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `ai` types.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Shadows the global `Image` name and is not `next/image`; import carefully.
