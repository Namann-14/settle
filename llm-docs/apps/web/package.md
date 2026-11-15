# apps/web/package.json

**Purpose:** Package manifest for the web app.

**Key contents:** Scripts `dev` (port 3001), `build`, `start`. Deps: Next 16, React 19, Clerk, TanStack Query, AI SDK (`ai`, `@ai-sdk/react`), Streamdown (+ `@streamdown/*` plugins), motion, and internal `@settle/env`, `@settle/ui`, `@settle/config`.

**Depends on / used by:** Workspace member of the monorepo.

**Decisions & caveats:** Chat UI relies on the AI SDK UI message stream (see `src/app/api/chat/route.ts`). Deps that only the old ai-elements files used (use-stick-to-bottom, @xyflow/react, media-chrome, shiki, tokenlens, nanoid, react-jsx-parser, ansi-to-react, @rive-app/react-webgl2, @radix-ui/react-use-controllable-state) were removed with them.
