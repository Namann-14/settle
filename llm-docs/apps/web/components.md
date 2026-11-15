# apps/web/components.json

**Purpose:** shadcn/ui configuration.

**Key contents:** Style `base-lyra`, RSC on, neutral base color, Lucide icons; CSS is in `packages/ui`, and aliases route `ui` and `utils` to `@settle/ui`.

**Depends on / used by:** Used by the shadcn CLI; relates to `packages/ui` and `apps/web/src/components`.

**Decisions & caveats:** Shared primitives live in the `@settle/ui` package rather than the app, so new shadcn components land there. The Tailwind config path is empty because Tailwind 4 is CSS-first. The `@aceternity` registry (`https://ui.aceternity.com/registry/{name}.json`) is registered. The old `@ai-elements` registry (ai-sdk.dev) was removed when the chat moved to shadcn AI Elements, which install by plain name (`shadcn add trace`).
