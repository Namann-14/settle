# apps/web/tsconfig.json

**Purpose:** TypeScript config for the Next.js web app.

**Key contents:** Strict, bundler resolution, `noEmit`, `verbatimModuleSyntax`, `jsx: react-jsx`, Next plugin. Path aliases `@/*` to `./src/*` and `@settle/ui/*` to `../../packages/ui/src/*`.

**Depends on / used by:** Does not extend `packages/config/tsconfig.base.json`; used by the Next build and `check-types`.

**Decisions & caveats:** Standalone settings (target ES2017, allowJs) differ from the shared base, which has `noUncheckedIndexedAccess` and unused-variable checks, so the web app is less strict. `verbatimModuleSyntax` requires `import type` for type-only imports.
