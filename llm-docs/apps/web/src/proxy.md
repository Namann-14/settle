# apps/web/src/proxy.ts

**Purpose:** Next.js middleware (named `proxy.ts` per Next 16) that applies Clerk auth.

**Key contents:** `clerkMiddleware` protecting `/dashboard(.*)` via `auth.protect()`; matcher skips Next internals and static files but always runs for `/api`, `/trpc` and `/__clerk`.

**Depends on / used by:** Clerk; protects pages that use `lib/server-prefetch.tsx`.

**Decisions & caveats:** Only `/dashboard` is protected here. API route handlers do their own token check in `backendFetch`/`aiFetch`, since they run for all API routes. The file name `proxy.ts` replaces `middleware.ts` in recent Next versions.
