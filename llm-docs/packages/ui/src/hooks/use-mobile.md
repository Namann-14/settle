# packages/ui/src/hooks/use-mobile.ts

**Purpose:** React hook reporting whether the viewport is below the mobile breakpoint.

**Key contents:** `useIsMobile()` returns a boolean using `matchMedia` at 768px and a change listener.

**Depends on / used by:** Used by components/sidebar.tsx to switch between inline sidebar and Sheet drawer.

**Decisions & caveats:** Initial state is undefined and coerced to false, so SSR and the first client render report desktop, and mobile flips after mount (possible brief flash).
