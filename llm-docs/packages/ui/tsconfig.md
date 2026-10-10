# packages/ui/tsconfig.json

**Purpose:** TypeScript config for the UI package.

**Key contents:** Extends `@settle/config/tsconfig.base.json`, react-jsx, DOM libs, no ambient types, and a `@settle/ui/*` path alias to `./src/*`.

**Depends on / used by:** Pairs with the package exports in packages/ui/package.json; the alias is what components use for internal imports.

**Decisions & caveats:** Internal imports use the `@settle/ui/...` alias rather than relative paths, so consumers must resolve it too.
