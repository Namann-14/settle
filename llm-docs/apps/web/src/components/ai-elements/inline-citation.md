# apps/web/src/components/ai-elements/inline-citation.tsx

**Purpose:** Inline citation badges with hover card carousel of sources.

**Key contents:** `InlineCitation`, text, card, card trigger (hostname badge), card body, carousel with header/index/prev/next, source and quote parts.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@settle/ui` Badge/HoverCard/Carousel.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. 
