# packages/config/tsconfig.base.json

**Purpose:** Shared strict TypeScript base config for packages.

**Key contents:** ESNext target/module, bundler resolution, strict, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax`, `types: [node]`.

**Depends on / used by:** Extended by `packages/env/tsconfig.json`. `apps/web/tsconfig.json` does not extend it.

**Decisions & caveats:** `noUncheckedIndexedAccess` makes array indexing return possibly-undefined, which surprises people. `lib: [ESNext]` has no DOM, so UI packages needing DOM types must override.
