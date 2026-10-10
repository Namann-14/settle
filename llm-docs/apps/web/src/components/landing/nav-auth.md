# apps/web/src/components/landing/nav-auth.tsx

**Purpose:** Auth-dependent part of the landing navbar.

**Key contents:** Client component: signed-out shows Sign In / Get Started Clerk modal buttons; signed-in shows a Dashboard link and `UserButton`.

**Depends on / used by:** Uses `@clerk/nextjs`; embedded in the landing navbar.

**Decisions & caveats:** Split out so the rest of the navbar stays server-rendered (decisions.md, faster first load). Buttons use `rounded-lg` to match the rectangular navbar.
