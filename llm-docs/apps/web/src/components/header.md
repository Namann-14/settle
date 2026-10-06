# apps/web/src/components/header.tsx

**Purpose:** Legacy top bar showing Clerk sign-in/sign-up buttons or the user menu.

**Key contents:** Default-exported `Header` client component: signed-out shows SignIn/SignUp buttons, signed-in shows `UserButton`. The nav links and `ModeToggle` block is commented out.

**Depends on / used by:** Uses `@clerk/nextjs`; imports `mode-toggle.tsx` (only for the commented block). Landing navbar now uses `landing/nav-auth.tsx` instead.

**Decisions & caveats:** Largely dead/vestigial: unused imports (`Link`, `ClerkProvider`, `ModeToggle`) and commented-out markup remain. Check usages before extending.
