# apps/web/src/components/ai-elements/code-block.tsx

**Purpose:** Syntax-highlighted code block with copy button and language selector.

**Key contents:** Highlighting via shiki (`highlightCode`, `createHighlighter`), plus `CodeBlock`, container/header/title/filename/actions/content, copy button and language selector parts.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `shiki` and `@settle/ui` Select/Button.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Shiki loads grammars/themes at runtime, which is bundle-heavy; it is the largest file in the set.
