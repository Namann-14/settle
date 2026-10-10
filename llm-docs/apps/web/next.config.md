# apps/web/next.config.ts

**Purpose:** Next.js config for the web app.

**Key contents:** Imports `@settle/env/web` (env validation at build) and enables `typedRoutes` and `reactCompiler`.

**Depends on / used by:** Uses `packages/env`.

**Decisions & caveats:** Importing the env module here makes a build fail fast on missing variables. The React Compiler needs `babel-plugin-react-compiler`.
